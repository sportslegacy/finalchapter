#!/bin/zsh
# Daily distribution digest — run by launchd (see com.finalchapter.digest.plist).
#
# Generates the ranked Reddit + news digest with paste-ready reply drafts,
# writes it to a dated file, and pops a macOS notification. DISCOVERY ONLY —
# never posts anywhere. You read the file and reply from your own account.
#
# The API key is read from ~/.zshenv (launchd runs with a bare environment, so
# we source it here rather than duplicating the secret into the plist).

emulate -L zsh
set -o pipefail

# Repo root = two levels up from this script, regardless of where launchd cwd's.
REPO="${0:A:h:h:h}"
OUT_DIR="$HOME/finalchapter-digests"
DATE="$(date +%Y-%m-%d)"
OUT="$OUT_DIR/digest-$DATE.txt"
HTML="$OUT_DIR/digest-$DATE.html"

mkdir -p "$OUT_DIR"

# Pull ANTHROPIC_API_KEY (and anything else) from the interactive env file.
[[ -f "$HOME/.zshenv" ]] && source "$HOME/.zshenv"

# launchd runs with a minimal PATH (/usr/bin:/bin:/usr/sbin:/sbin) that omits
# Homebrew, so `node` isn't found unless we add it. Cover Apple-Silicon and
# Intel Homebrew prefixes.
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

cd "$REPO" || exit 1

# Fail loudly (to the err log) if node still isn't resolvable.
if ! command -v node >/dev/null 2>&1; then
  echo "node not found on PATH=$PATH" >&2
  osascript -e "display notification \"node not found — digest skipped\" with title \"Final Chapter digest\"" 2>/dev/null
  exit 127
fi

# Run the digest into TEMP files first; only promote to the dated files +
# "latest" pointers once we've confirmed the run actually produced output.
# A transient Reddit-RSS/API hiccup used to leave a 0-byte digest behind and
# silently strand latest.html on the previous day (seen 2026-06-07).
#
# stdout → digest file; node's stderr (ESM reparse notice + any real error)
# → a dedicated log so failures are diagnosable but the digest stays clean.
run_digest() {
  node scripts/distribution/discover.mjs --draft --days=7 --html="$HTML.tmp" \
    >"$OUT.tmp" 2>"$OUT_DIR/node.err.log"
  local rc=$?
  # Success = clean exit AND non-empty text AND non-empty HTML. `-s` is
  # false for missing or zero-byte files, which is exactly the failure mode.
  [[ $rc -eq 0 && -s "$OUT.tmp" && -s "$HTML.tmp" ]]
}

# Try once, then retry a single time after a short pause for transient flakiness.
rc=1
for attempt in 1 2; do
  if run_digest; then rc=0; break; fi
  [[ $attempt -eq 1 ]] && sleep 20
done

if [[ $rc -eq 0 ]]; then
  # Promote temp → dated files, then refresh the stable "latest" pointers.
  mv -f "$OUT.tmp" "$OUT"
  mv -f "$HTML.tmp" "$HTML"
  cp -f "$OUT" "$OUT_DIR/latest.txt" 2>/dev/null
  cp -f "$HTML" "$OUT_DIR/latest.html" 2>/dev/null
  drafts=$(grep -c "draft reply" "$OUT" 2>/dev/null || echo 0)
  msg="$drafts draft(s) ready · $(basename "$OUT")"
else
  # Failed run: discard the empty/partial temp files and LEAVE the existing
  # latest.* pointers untouched so yesterday's digest stays openable.
  rm -f "$OUT.tmp" "$HTML.tmp" 2>/dev/null
  msg="run failed (empty output after retry) — see node.err.log"
fi

# macOS notification (clicking it does nothing actionable, but it pings you).
osascript -e "display notification \"$msg\" with title \"Final Chapter digest\" subtitle \"$DATE\"" 2>/dev/null

echo "$OUT"

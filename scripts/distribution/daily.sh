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

# stdout → digest file; node's stderr (ESM reparse notice + any real error)
# → a dedicated log so failures are diagnosable but the digest stays clean.
node scripts/distribution/discover.mjs --draft --days=7 --html="$HTML" >"$OUT" 2>"$OUT_DIR/node.err.log"
rc=$?

# Keep stable "latest" pointers for quick opening (text + the styled HTML view).
cp -f "$OUT" "$OUT_DIR/latest.txt" 2>/dev/null
cp -f "$HTML" "$OUT_DIR/latest.html" 2>/dev/null

# Count drafts produced so the notification is informative.
drafts=$(grep -c "draft reply" "$OUT" 2>/dev/null || echo 0)

if [[ $rc -eq 0 ]]; then
  msg="$drafts draft(s) ready · $(basename "$OUT")"
else
  msg="run failed (exit $rc) — see $OUT"
fi

# macOS notification (clicking it does nothing actionable, but it pings you).
osascript -e "display notification \"$msg\" with title \"Final Chapter digest\" subtitle \"$DATE\"" 2>/dev/null

echo "$OUT"

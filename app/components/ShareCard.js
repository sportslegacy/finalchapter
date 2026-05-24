"use client";

import { useRef, useCallback } from "react";

export default function ShareCard({ player }) {
  const cardRef = useRef(null);

  const handleShare = useCallback(async () => {
    if (!cardRef.current) return;

    try {
      // Use html2canvas-like approach via canvas API
      const card = cardRef.current;
      const canvas = document.createElement("canvas");
      const scale = 2; // retina
      canvas.width = card.offsetWidth * scale;
      canvas.height = card.offsetHeight * scale;
      const ctx = canvas.getContext("2d");
      ctx.scale(scale, scale);

      // Draw background
      const gradient = ctx.createLinearGradient(
        0,
        0,
        card.offsetWidth,
        card.offsetHeight
      );
      gradient.addColorStop(0, "#111118");
      gradient.addColorStop(1, "#1a1a24");
      ctx.fillStyle = gradient;
      ctx.roundRect(0, 0, card.offsetWidth, card.offsetHeight, 12);
      ctx.fill();

      // Gold top bar
      const goldGrad = ctx.createLinearGradient(0, 0, card.offsetWidth, 0);
      goldGrad.addColorStop(0, "#d4a853");
      goldGrad.addColorStop(0.5, "#f0d48a");
      goldGrad.addColorStop(1, "#d4a853");
      ctx.fillStyle = goldGrad;
      ctx.fillRect(0, 0, card.offsetWidth, 3);

      const centerX = card.offsetWidth / 2;
      let y = 40;

      // Label
      ctx.fillStyle = "#5a5a72";
      ctx.font = "600 9px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.letterSpacing = "3px";
      ctx.fillText("THE FINAL CHAPTER • 2026", centerX, y);
      y += 35;

      // Flag emoji
      ctx.font = "40px serif";
      ctx.fillText(player.countryFlag, centerX, y);
      y += 30;

      // Name
      ctx.fillStyle = "#d4a853";
      ctx.font = "bold 28px Playfair Display, Georgia, serif";
      ctx.fillText(player.name, centerX, y);
      y += 25;

      // Country
      ctx.fillStyle = "#9a9ab0";
      ctx.font = "14px Inter, sans-serif";
      ctx.fillText(
        `${player.country} • ${player.position}`,
        centerX,
        y
      );
      y += 35;

      // Stats
      const stats = [
        { val: player.worldCupGoals, label: "GOALS" },
        { val: player.worldCupAssists, label: "ASSISTS" },
        { val: player.worldCupApps, label: "APPS" },
      ];
      const statWidth = card.offsetWidth / stats.length;
      stats.forEach((stat, i) => {
        const sx = statWidth * i + statWidth / 2;
        ctx.fillStyle = "#f0f0f2";
        ctx.font = "800 26px Inter, sans-serif";
        ctx.fillText(String(stat.val), sx, y);
        ctx.fillStyle = "#5a5a72";
        ctx.font = "600 8px Inter, sans-serif";
        ctx.fillText(stat.label, sx, y + 16);
      });
      y += 40;

      // Divider
      ctx.strokeStyle = "#222233";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(30, y);
      ctx.lineTo(card.offsetWidth - 30, y);
      ctx.stroke();
      y += 25;

      // World Cup stamps
      const stamps = player.worldCups;
      const stampSize = 36;
      const stampGap = 10;
      const totalStampsWidth =
        stamps.length * stampSize + (stamps.length - 1) * stampGap;
      let stampX = centerX - totalStampsWidth / 2 + stampSize / 2;

      stamps.forEach((wc) => {
        const isFuture = wc.year === 2026;
        const isChamp = wc.result?.includes("Champion");

        ctx.beginPath();
        ctx.arc(stampX, y, stampSize / 2, 0, Math.PI * 2);

        if (isChamp) {
          ctx.strokeStyle = "#d4a853";
          ctx.lineWidth = 2;
          ctx.fillStyle = "rgba(212,168,83,0.1)";
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = "#d4a853";
        } else if (isFuture) {
          ctx.setLineDash([4, 4]);
          ctx.strokeStyle = "#a88535";
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = "#a88535";
        } else {
          ctx.strokeStyle = "#222233";
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.fillStyle = "#9a9ab0";
        }

        ctx.font = "bold 10px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(String(wc.year).slice(-2), stampX, y + 4);

        stampX += stampSize + stampGap;
      });

      y += 35;

      // Branding
      ctx.fillStyle = "#5a5a72";
      ctx.font = "8px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("finalchapter2026.com", centerX, y);

      // Convert to blob and share/download
      canvas.toBlob(async (blob) => {
        if (navigator.share && navigator.canShare) {
          try {
            const file = new File(
              [blob],
              `final-chapter-${player.id}.png`,
              { type: "image/png" }
            );
            if (navigator.canShare({ files: [file] })) {
              await navigator.share({
                title: `${player.name} — The Final Chapter`,
                text: `${player.name}'s World Cup journey. The final chapter at WC 2026.`,
                files: [file],
              });
              return;
            }
          } catch (e) {
            // Fall through to download
          }
        }

        // Fallback: download
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `final-chapter-${player.id}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }, "image/png");
    } catch (err) {
      console.error("Share failed:", err);
    }
  }, [player]);

  return (
    <section className="share-section">
      <div className="section-header">
        <div className="section-label">Share the legacy</div>
        <h2 className="section-title">Career Card</h2>
      </div>

      <div className="share-card" ref={cardRef}>
        <div className="share-card-label">THE FINAL CHAPTER &bull; 2026</div>
        <div className="share-card-flag">{player.countryFlag}</div>
        <div className="share-card-name">{player.name}</div>
        <div className="share-card-country">
          {player.country} &middot; {player.position}
        </div>
        <div className="share-card-stats">
          <div>
            <div className="share-card-stat-value">{player.worldCupGoals}</div>
            <div className="share-card-stat-label">Goals</div>
          </div>
          <div>
            <div className="share-card-stat-value">
              {player.worldCupAssists}
            </div>
            <div className="share-card-stat-label">Assists</div>
          </div>
          <div>
            <div className="share-card-stat-value">{player.worldCupApps}</div>
            <div className="share-card-stat-label">Apps</div>
          </div>
        </div>
        <div className="share-card-wcs">
          {player.worldCups.map((wc) => {
            const isChamp = wc.result?.includes("Champion");
            const isFuture = wc.year === 2026;
            return (
              <div
                key={wc.year}
                className={`wc-stamp ${isChamp ? "champion" : ""} ${isFuture ? "future" : ""}`}
              >
                {String(wc.year).slice(-2)}
              </div>
            );
          })}
        </div>
        <div className="share-card-branding">finalchapter2026.com</div>
      </div>

      <button onClick={handleShare} className="share-btn">
        Share this card &rarr;
      </button>
    </section>
  );
}

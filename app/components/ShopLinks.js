import { playerShopLinks } from "../../data/players";

// Editorial "fan shop" block — Amazon Associates affiliate links (kit + books)
// rendered on each player page inside the .player-accent-scope so it picks up
// the national colors. Server component, no client JS. Links are marked
// rel="sponsored" and the relationship is disclosed below them, both required
// by the Associates Program Operating Agreement.
export default function ShopLinks({ player }) {
  const links = playerShopLinks(player);
  return (
    <section className="shop-section" aria-label={`Shop ${player.name}`}>
      <div className="section-header">
        <div className="section-label">Fan Shop</div>
        <h2 className="section-title">Wear the Colors</h2>
      </div>
      <div className="shop-grid">
        {links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            target="_blank"
            rel="sponsored noopener noreferrer"
            className="shop-card"
          >
            <span className="shop-card-label">{l.label}</span>
            <span className="shop-card-sub">{l.sublabel}</span>
            <span className="shop-card-cta" aria-hidden="true">
              Shop on Amazon &rarr;
            </span>
          </a>
        ))}
      </div>
      <p className="shop-disclosure">
        As an Amazon Associate, The Final Chapter earns from qualifying
        purchases.
      </p>
    </section>
  );
}

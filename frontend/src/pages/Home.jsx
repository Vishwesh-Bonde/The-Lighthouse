import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMenuItems } from '../api/menuApi';
import { getReviews } from '../api/reviewApi';
import MenuCard from '../components/MenuCard';
import { useAuth } from '../context/AuthContext';
import Tooltip from '../components/Tooltip';

const Stars = ({ rating }) => (
  <div className="stars">
    {[1,2,3,4,5].map((s) => (
      <span key={s} className={s <= rating ? 'star-filled' : 'star-empty'}>★</span>
    ))}
  </div>
);

const Home = () => {
  const { user } = useAuth();
  const [featured, setFeatured] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(true);

  useEffect(() => {
    getMenuItems({ tag: 'chef-special' })
      .then(({ data }) => setFeatured(data.data.slice(0, 3)))
      .catch(console.error)
      .finally(() => setLoadingMenu(false));

    getReviews()
      .then(({ data }) => setReviews(data.data.slice(0, 3)))
      .catch(console.error);
  }, []);

  return (
    <main className="page-enter">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero__bg" style={{ backgroundImage: "url('/images/hero-restaurant.jpg')" }} />
        <div className="hero__overlay" />
        <div className="container hero__content">
          <span className="section-label">Est. 2024 · Mumbai</span>
          <h1 className="hero__title">
            Where Every Dish<br />
            <em className="gold">Tells a Story</em>
          </h1>
          <p className="hero__subtitle">
            Fine dining with live menu availability — no surprises, only excellence.
          </p>
          <div className="hero__cta">
            <Tooltip content="Book a table for your dining experience" position="top">
              <Link to="/reserve" className="btn btn-primary">Reserve a Table</Link>
            </Tooltip>
            <Tooltip content="Explore our live menu with real-time availability" position="top">
              <Link to="/menu" className="btn btn-outline">Explore Menu</Link>
            </Tooltip>
          </div>
          <div className="hero__feature-pill">
            <span className="avail-dot available" />
            Live menu availability — know what's on tonight before you arrive
          </div>
        </div>
      </section>

      {/* Problem / Solution Section */}
      <section className="section problem-section">
        <div className="container">
          <div className="problem-cards">
            <div className="problem-card problem-card--before">
              <div className="problem-icon">😤</div>
              <h3>Other Restaurant Apps</h3>
              <ul>
                <li>Static menus — no real-time updates</li>
                <li>Book a table, then discover dishes are sold out</li>
                <li>No dietary profile — filter resets every visit</li>
                <li>Zero insight into tonight's special</li>
              </ul>
            </div>
            <div className="problem-divider">VS</div>
            <div className="problem-card problem-card--after">
              <div className="problem-icon">✨</div>
              <h3>The Lighthouse</h3>
              <ul>
                <li><span className="gold">Live availability</span> — dishes toggle in real-time</li>
                <li>See tonight's menu <span className="gold">during your booking</span></li>
                <li>Dietary profile <span className="gold">saved to your account</span></li>
                <li>Admin panel — no code changes needed</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Chef's Specials */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">From the Kitchen</span>
            <h2 className="section-title">Chef's Specials Tonight</h2>
            <div className="divider">
              <div className="divider-line" />
              <div className="divider-diamond" />
              <div className="divider-line right" />
            </div>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              Updated live — these are the dishes <em>actually available</em> right now.
            </p>
          </div>
          {loadingMenu ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
              <div className="spinner" />
            </div>
          ) : featured.length > 0 ? (
            <div className="grid-3">
              {featured.map((item) => <MenuCard key={item._id} item={item} />)}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>No specials available right now.</p>
          )}
          <div style={{ textAlign: 'center', marginTop: 'var(--space-xl)' }}>
            <Tooltip content="View all dishes on our full menu" position="top">
              <Link to="/menu" className="btn btn-outline">View Full Menu →</Link>
            </Tooltip>
          </div>
        </div>
      </section>

      {/* Chef Section */}
      <section className="section chef-section">
        <div className="container chef-inner">
          <div className="chef-image-wrap">
            <img src="/images/chef.jpg" alt="Head Chef" className="chef-image" />
          </div>
          <div className="chef-content">
            <span className="section-label">Meet Our Chef</span>
            <h2 className="section-title">A Master of Flavour</h2>
            <div className="divider" style={{ justifyContent: 'flex-start' }}>
              <div className="divider-line" /><div className="divider-diamond" /><div className="divider-line right" />
            </div>
            <p className="chef-bio">
              With over two decades of culinary artistry, our executive chef crafts every dish from locally sourced, seasonal ingredients.
              The live menu reflects what's freshest today — not yesterday's printed card.
            </p>
            <Tooltip content="Book your dining experience with us" position="top">
              <Link to="/reserve" className="btn btn-primary" style={{ marginTop: 'var(--space-lg)' }}>
                Book Your Experience
              </Link>
            </Tooltip>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <span className="section-label">Guest Experiences</span>
              <h2 className="section-title">What Our Guests Say</h2>
              <div className="divider">
                <div className="divider-line" /><div className="divider-diamond" /><div className="divider-line right" />
              </div>
            </div>
            <div className="grid-3">
              {reviews.map((r) => (
                <div key={r._id} className="card review-card">
                  <div className="review-card__inner">
                    <Stars rating={r.rating} />
                    <p className="review-card__comment">"{r.comment}"</p>
                    <div className="review-card__author">
                      <div className="review-card__avatar">{r.user?.name?.[0] || 'G'}</div>
                      <span>{r.user?.name || 'Guest'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="section cta-section">
        <div className="container cta-inner">
          <span className="section-label">Reserve Your Evening</span>
          <h2 className="section-title">Ready for an Unforgettable Meal?</h2>
          <p className="section-subtitle" style={{ margin: '1rem auto' }}>
            Check tonight's live menu, pick your time slot, and walk in knowing exactly what to expect.
          </p>
          <Tooltip content="Book your table for an unforgettable dining experience" position="top">
            <Link to="/reserve" className="btn btn-primary" style={{ marginTop: 'var(--space-lg)' }}>
              Make a Reservation
            </Link>
          </Tooltip>
        </div>
      </section>

      <style>{`
        .hero { position: relative; min-height: 100vh; display: flex; align-items: center; overflow: hidden; }
        .hero__bg { position: absolute; inset: 0; background-size: cover; background-position: center; transform: scale(1.05); transition: transform 8s ease; }
        .hero:hover .hero__bg { transform: scale(1); }
        .hero__overlay { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(26,23,20,0.85) 0%, rgba(26,23,20,0.5) 100%); }
        .hero__content { position: relative; z-index: 1; max-width: 680px; padding-top: var(--navbar-h); }
        .hero__title { font-family: var(--font-serif); font-size: clamp(3rem, 6vw, 5.5rem); font-weight: 300; color: var(--color-text); line-height: 1.1; margin: 1rem 0; }
        .hero__subtitle { font-size: 1.1rem; color: var(--color-text-muted); margin-bottom: var(--space-xl); max-width: 500px; }
        .hero__cta { display: flex; gap: var(--space-md); flex-wrap: wrap; }
        .hero__feature-pill { display: inline-flex; align-items: center; gap: 8px; margin-top: var(--space-xl); padding: 0.5rem 1rem; background: rgba(76,175,125,0.1); border: 1px solid rgba(76,175,125,0.25); border-radius: var(--radius-full); font-size: 0.78rem; color: var(--color-text-muted); }

        .problem-section { background: var(--color-bg-elevated); }
        .problem-cards { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: var(--space-xl); }
        .problem-card { padding: var(--space-xl); border-radius: var(--radius-lg); }
        .problem-card--before { background: rgba(224,92,92,0.06); border: 1px solid rgba(224,92,92,0.15); }
        .problem-card--after  { background: rgba(201,169,98,0.06); border: 1px solid var(--color-border); }
        .problem-icon { font-size: 2rem; margin-bottom: var(--space-md); }
        .problem-card h3 { font-family: var(--font-serif); font-size: 1.3rem; margin-bottom: var(--space-md); }
        .problem-card ul { display: flex; flex-direction: column; gap: 0.6rem; }
        .problem-card li { font-size: 0.88rem; color: var(--color-text-muted); padding-left: 1rem; position: relative; }
        .problem-card li::before { content: '—'; position: absolute; left: 0; color: var(--color-text-faint); }
        .problem-divider { font-family: var(--font-serif); font-size: 1.5rem; color: var(--color-primary); font-style: italic; white-space: nowrap; }

        .chef-section { background: var(--color-bg-elevated); }
        .chef-inner { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3xl); align-items: center; }
        .chef-image-wrap { border-radius: var(--radius-lg); overflow: hidden; }
        .chef-image { width: 100%; height: 480px; object-fit: cover; }
        .chef-bio { font-size: 1rem; color: var(--color-text-muted); line-height: 1.8; }

        .review-card__inner { padding: var(--space-xl); display: flex; flex-direction: column; gap: var(--space-md); }
        .review-card__comment { font-family: var(--font-serif); font-size: 1rem; font-style: italic; color: var(--color-text-muted); line-height: 1.7; flex: 1; }
        .review-card__author { display: flex; align-items: center; gap: var(--space-sm); font-size: 0.85rem; color: var(--color-text-muted); }
        .review-card__avatar { width: 32px; height: 32px; background: var(--color-primary); color: var(--color-bg); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.8rem; }

        .cta-section { text-align: center; background: linear-gradient(180deg, var(--color-bg) 0%, var(--color-bg-elevated) 100%); }
        .cta-inner { display: flex; flex-direction: column; align-items: center; }

        @media (max-width: 768px) {
          .problem-cards { grid-template-columns: 1fr; }
          .problem-divider { text-align: center; }
          .chef-inner { grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  );
};

export default Home;

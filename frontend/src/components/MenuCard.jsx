import { toggleAvailability } from '../api/menuApi';
import { useMenu } from '../context/MenuContext';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import Tooltip from './Tooltip';

const TAG_LABELS = {
  'seasonal':     { label: 'Seasonal', icon: '🍃' },
  'chef-special': { label: "Chef's Special", icon: '👨‍🍳' },
  'popular':      { label: 'Popular', icon: '⭐' },
  'new':          { label: 'New', icon: '✨' },
  'spicy':        { label: 'Spicy', icon: '🌶️' }
};

const MenuCard = ({ item }) => {
  const { updateItem } = useMenu();
  const { user } = useAuth();
  const [toggling, setToggling] = useState(false);

  const isAdmin = user?.role === 'admin';

  const handleToggle = async () => {
    setToggling(true);
    try {
      const { data } = await toggleAvailability(item._id);
      updateItem(data.data);
    } catch (err) {
      console.error('Toggle failed', err);
    } finally {
      setToggling(false);
    }
  };

  return (
    <article className={`menu-card card ${!item.isAvailable ? 'menu-card--unavailable' : ''}`}>
      <div className="menu-card__image-wrap">
        <img
          src={item.image || '/images/dinner.jpg'}
          alt={item.name}
          className="menu-card__image"
          onError={(e) => { e.target.src = '/images/dinner.jpg'; }}
        />
        
        <Tooltip content={item.isAvailable ? "Available today" : "Sold out today"} position="top">
          <div className={`menu-card__avail-badge ${item.isAvailable ? 'available' : 'sold-out'}`}>
            <span className={`avail-dot ${item.isAvailable ? 'available' : 'unavailable'}`} />
            {item.isAvailable ? 'Available' : 'Sold Out'}
          </div>
        </Tooltip>

        <Tooltip content={item.isVeg ? 'Vegetarian dish' : 'Non-Vegetarian dish'} position="bottom">
          <div className={`menu-card__diet-dot ${item.isVeg ? 'veg' : 'nonveg'}`} />
        </Tooltip>
      </div>

      <div className="menu-card__body">
        <div className="menu-card__tags">
          {item.tags.map((tag) => (
            <Tooltip key={tag} content={`${TAG_LABELS[tag]?.label || tag} dish`} position="top">
              <span className="badge badge-gold">
                {TAG_LABELS[tag]?.icon} {TAG_LABELS[tag]?.label || tag}
              </span>
            </Tooltip>
          ))}
        </div>

        <h3 className="menu-card__name">{item.name}</h3>
        <p className="menu-card__desc">{item.description}</p>

        <div className="menu-card__footer">
          <span className="menu-card__price">₹{item.price}</span>
          <Tooltip content={`Preparation time: ${item.preparationTime} minutes`} position="top">
            <span className="menu-card__time">⏱ {item.preparationTime} min</span>
          </Tooltip>
        </div>

        {isAdmin && (
          <div className="menu-card__admin">
            <Tooltip content={item.isAvailable ? "Mark as sold out" : "Mark as available"} position="top">
              <span className="menu-card__admin-label">
                {item.isAvailable ? 'Mark as Sold Out' : 'Mark as Available'}
              </span>
            </Tooltip>
            <Tooltip content="Toggle dish availability" position="top">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={item.isAvailable}
                  onChange={handleToggle}
                  disabled={toggling}
                />
                <span className="toggle-slider" />
              </label>
            </Tooltip>
          </div>
        )}
      </div>

      <style>{`
        .menu-card { position: relative; display: flex; flex-direction: column; }
        .menu-card--unavailable { opacity: 0.6; }
        .menu-card--unavailable .menu-card__image { filter: grayscale(60%); }
        .menu-card__image-wrap { position: relative; overflow: hidden; height: 200px; }
        .menu-card__image { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
        .menu-card:hover .menu-card__image { transform: scale(1.05); }

        .menu-card__avail-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: var(--radius-full);
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          backdrop-filter: blur(8px);
        }
        .menu-card__avail-badge.available { background: rgba(76,175,125,0.2); color: var(--color-success); border: 1px solid rgba(76,175,125,0.3); }
        .menu-card__avail-badge.sold-out  { background: rgba(120,120,120,0.25); color: var(--color-text-muted); border: 1px solid rgba(120,120,120,0.3); }

        .menu-card__diet-dot {
          position: absolute;
          bottom: 10px;
          left: 10px;
          width: 18px;
          height: 18px;
          border-radius: 3px;
          border: 2px solid;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .menu-card__diet-dot::after {
          content: '';
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .menu-card__diet-dot.veg    { border-color: var(--color-success); }
        .menu-card__diet-dot.veg::after { background: var(--color-success); }
        .menu-card__diet-dot.nonveg { border-color: var(--color-error); }
        .menu-card__diet-dot.nonveg::after { background: var(--color-error); }

        .menu-card__body { padding: var(--space-lg); flex: 1; display: flex; flex-direction: column; gap: var(--space-sm); }
        .menu-card__tags { display: flex; flex-wrap: wrap; gap: var(--space-xs); }
        .menu-card__name { font-family: var(--font-serif); font-size: 1.3rem; color: var(--color-text); }
        .menu-card__desc { font-size: 0.85rem; color: var(--color-text-muted); line-height: 1.5; flex: 1; }
        .menu-card__footer { display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding-top: var(--space-md); border-top: 1px solid var(--color-border); }
        .menu-card__price { font-family: var(--font-serif); font-size: 1.4rem; color: var(--color-primary); }
        .menu-card__time  { font-size: 0.75rem; color: var(--color-text-faint); }

        .menu-card__admin {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: var(--space-md);
          border-top: 1px dashed var(--color-border);
        }
        .menu-card__admin-label { font-size: 0.75rem; color: var(--color-text-faint); }
      `}</style>
    </article>
  );
};

export default MenuCard;

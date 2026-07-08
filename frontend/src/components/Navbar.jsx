import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Tooltip from './Tooltip';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-icon">🌊</span>
          <span className="navbar__logo-text">The Lighthouse</span>
        </Link>

        <nav className={`navbar__nav ${menuOpen ? 'navbar__nav--open' : ''}`}>
          <NavLink to="/" end onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}>
            Home
          </NavLink>
          <NavLink to="/menu" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}>
            Menu
          </NavLink>
          <NavLink to="/reserve" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}>
            Reserve
          </NavLink>

          {user ? (
            <>
              {user.role === 'admin' && (
                <NavLink to="/admin" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}>
                  Admin
                </NavLink>
              )}
              <div className="navbar__user">
                <span className="navbar__user-name">Hi, {user.name.split(' ')[0]}</span>
                <Tooltip content="Sign out of your account" position="bottom">
                  <button className="btn btn-ghost" onClick={handleLogout}>Logout</button>
                </Tooltip>
              </div>
            </>
          ) : (
            <Tooltip content="Sign in to your account" position="bottom">
              <Link to="/auth" onClick={() => setMenuOpen(false)} className="btn btn-primary">
                Sign In
              </Link>
            </Tooltip>
          )}
        </nav>

        <Tooltip content="Toggle navigation menu" position="bottom">
          <button
            className={`navbar__hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </Tooltip>
      </div>
    </header>
  );
};

export default Navbar;
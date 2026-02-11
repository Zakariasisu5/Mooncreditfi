import { NavLink } from 'react-router-dom';
import WalletConnectButton from './WalletConnectButton';
import NotificationButton from './NotificationButton';

const Navbar = ({ onToggleSidebar }) => {
  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border px-3 py-2 sm:px-4 sm:py-3">
      <div className="container mx-auto flex justify-between items-center gap-2 min-h-[44px]">
        <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
          {/* hamburger - visible on mobile only */}
          <button
            aria-label="Toggle menu"
            className="md:hidden p-2 rounded-md hover:bg-muted transition-colors flex-shrink-0"
            onClick={() => onToggleSidebar && onToggleSidebar()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <NavLink to="/dashboard" className="flex items-center flex-shrink-0" aria-label="MoonCreditFi">
            <img
              src="/logo.png"
              alt="MoonCreditFi logo"
              className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-md object-cover"
              aria-hidden={false}
              onError={(e) => { e.currentTarget.src = '/moonfi-logo.svg'; }}
            />
          </NavLink>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <NotificationButton />
          <WalletConnectButton />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

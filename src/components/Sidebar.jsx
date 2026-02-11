import { NavLink, useLocation } from 'react-router-dom';
import { Home, TrendingUp, User, Zap, Star, DollarSign, CreditCard } from 'lucide-react';

const Sidebar = ({ sidebarOpen = false, onClose }) => {
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: DollarSign, label: 'Lend', path: '/lend' },
    { icon: CreditCard, label: 'Borrow', path: '/borrow' },
    { icon: User, label: 'Credit Profile', path: '/credit' },
    { icon: TrendingUp, label: 'DeFi Insights', path: '/defi' },
    { icon: Zap, label: 'DePIN Finance', path: '/depin' },
  ];

  return (
    // On mobile: hidden by default, slide in when sidebarOpen is true.
    // On md+ screens the sidebar is sticky beneath the navbar so it stays visible while scrolling.
    <aside className={`fixed z-50 inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:sticky md:top-16 md:inset-y-auto md:h-[calc(100vh-4rem)] md:w-64 transition-transform duration-200 bg-card border-r border-border p-4 w-64 overflow-auto`}> 
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mooncreditfi-glow">MoonCreditFi</h2>
          <p className="text-sm text-muted-foreground">Moonshot Universe</p>
        </div>
        <button className="md:hidden p-2 rounded" onClick={() => onClose && onClose()} aria-label="Close menu">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => onClose && onClose()}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'active' : ''}`
            }
          >
            <item.icon className="h-5 w-5 mr-3" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
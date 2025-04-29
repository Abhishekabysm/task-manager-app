'use client'; // Needed for hooks like usePathname and client-side interactions

import Link from 'next/link';
import { usePathname } from 'next/navigation'; // To highlight active link
import { useAuth } from '../context/AuthContext'; // To get logout function

// Placeholder icons (replace with actual SVGs or an icon library like react-icons)
const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>;
const ProfileIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.438.995a6.932 6.932 0 0 1 0 .255c0 .382.145.755.438.995l1.003.827c.431.355.53 1.005.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.075.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.437-.995a6.932 6.932 0 0 1 0-.255c0-.382-.145-.755-.437-.995l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" /></svg>;

const Sidebar = ({ isOpen = true }) => { // Add isOpen prop, default to true
  const pathname = usePathname();
  const { logout } = useAuth();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
    { href: '/profile', label: 'Profile', icon: ProfileIcon }, // Placeholder
    { href: '/settings', label: 'Settings', icon: SettingsIcon }, // Placeholder
  ];

  return (
    // Adjust width based on isOpen state
    <aside className={`flex h-screen flex-col bg-gray-900 text-gray-300 transition-all duration-300 ease-in-out ${isOpen ? 'w-64' : 'w-20'}`}>
      {/* Logo Placeholder */}
      <div className={`flex h-16 items-center border-b border-gray-700 ${isOpen ? 'justify-center' : 'justify-center'}`}>
         {/* Show full logo or icon based on state */}
        <span className={`font-bold text-white ${isOpen ? 'text-2xl' : 'text-lg'}`}>{isOpen ? 'TaskMgr' : 'TM'}</span>
      </div>

      {/* Navigation */}
      <nav className="flex-grow p-4">
        <ul>
          {navItems.map((item) => {
            // Disable profile/settings links for now
            const isPlaceholder = ['/profile', '/settings'].includes(item.href);
            const isActive = !isPlaceholder && pathname === item.href;
            return (
              <li key={item.href} className="mb-2">
                <Link
                  href={item.href}
                  className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 ease-in-out ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                      : isPlaceholder
                      ? 'cursor-not-allowed text-gray-500' // Style disabled links
                      : 'hover:bg-gray-700 hover:text-white'
                  } ${!isOpen ? 'justify-center' : ''}`} // Center icon when collapsed
                >
                  <item.icon />
                  {/* Conditionally render label */}
                  {isOpen && <span className="ml-3">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="border-t border-gray-700 p-4">
        <button
          onClick={logout}
          className={`flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-red-700 hover:text-white ${!isOpen ? 'justify-center' : ''}`}
          title={isOpen ? "" : "Log out"} // Add tooltip when collapsed
        >
          <LogoutIcon />
          {isOpen && <span className="ml-3">Log out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

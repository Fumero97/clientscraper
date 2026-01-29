'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart2, 
  Globe, 
  ShieldAlert, 
  Settings, 
  Database,
  LayoutDashboard
} from 'lucide-react';
import { motion } from 'framer-motion';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Web Pages', icon: Globe, path: '/pages' },
  { name: 'Products Reference', icon: Database, path: '/coherence' },
  { name: 'Discrepancy Notes', icon: ShieldAlert, path: '/discrepancies' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">C</div>
        <span>Coherence AI</span>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          
          return (
            <Link key={item.path} href={item.path}>
              <motion.div 
                className={`nav-item ${isActive ? 'active' : ''}`}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon size={20} />
                <span>{item.name}</span>
                {isActive && (
                  <motion.div 
                    layoutId="active-nav"
                    className="active-indicator"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="avatar">JD</div>
          <div className="user-info">
            <p className="name">User Agent</p>
            <p className="role">Administrator</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .sidebar {
          width: 280px;
          height: 100vh;
          background: var(--sidebar-bg);
          border-right: 1px solid var(--border-color);
          position: fixed;
          left: 0;
          top: 0;
          display: flex;
          flex-direction: column;
          z-index: 1000;
        }

        .sidebar-logo {
          padding: 32px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .logo-icon {
          width: 32px;
          height: 32px;
          background: var(--accent-color);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          box-shadow: 0 0 15px var(--accent-glow);
        }

        .sidebar-nav {
          padding: 0 16px;
          flex: 1;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          color: var(--text-secondary);
          position: relative;
          margin-bottom: 4px;
          transition: color 0.2s ease;
        }

        .nav-item:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.03);
        }

        .nav-item.active {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.05);
        }

        .active-indicator {
          position: absolute;
          left: 0;
          top: 8px;
          bottom: 8px;
          width: 3px;
          background: var(--accent-color);
          border-radius: 0 4px 4px 0;
        }

        .sidebar-footer {
          padding: 24px;
          border-top: 1px solid var(--border-color);
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .avatar {
          width: 40px;
          height: 40px;
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
        }

        .user-info .name {
          font-weight: 600;
          font-size: 14px;
        }

        .user-info .role {
          font-size: 12px;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}

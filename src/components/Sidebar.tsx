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
    <div className="w-[280px] h-screen bg-white border-r border-slate-200 fixed left-0 top-0 flex flex-col z-50">
      <div className="p-8 flex items-center gap-3 text-xl font-bold tracking-tight text-slate-900">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
          C
        </div>
        <span>Coherence AI</span>
      </div>
      
      <nav className="flex-1 px-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          
          return (
            <Link key={item.path} href={item.path}>
              <motion.div 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-1 relative transition-colors ${
                  isActive 
                    ? 'text-blue-700 bg-blue-50 font-medium' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon size={20} className={isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'} />
                <span>{item.name}</span>
                {isActive && (
                  <motion.div 
                    layoutId="active-nav"
                    className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 rounded-r-lg"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center font-semibold text-slate-600">
            JD
          </div>
          <div className="flex flex-col">
            <p className="font-semibold text-sm text-slate-900">User Agent</p>
            <p className="text-xs text-slate-500">Administrator</p>
          </div>
        </div>
      </div>
    </div>
  );
}

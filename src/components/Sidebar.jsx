import { Package, BarChart3, Clock, Settings, Box, HelpCircle } from 'lucide-react';
import clsx from 'clsx';
import { useInventory } from '../context/InventoryContext';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3, disabled: true },
  { id: 'inventory', label: 'Frame Inventory', icon: Package },
  { id: 'explorer', label: 'Historical Data', icon: Clock },
  { id: 'settings', label: 'Settings', icon: Settings, disabled: true },
  { id: 'help', label: 'Help Center', icon: HelpCircle },
];

export default function Sidebar() {
  const { activeView, setActiveView } = useInventory();

  return (
    <aside className="w-56 shrink-0 border-r border-gray-200 bg-white flex flex-col h-screen sticky top-0">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-200">
        <Box className="w-6 h-6 text-indigo-600" />
        <span className="font-semibold text-sm text-gray-900">FrameStock</span>
      </div>

      <nav className="flex-1 py-3 px-3 space-y-0.5">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = item.id === activeView;
          return (
            <button
              key={item.id}
              disabled={item.disabled}
              onClick={() => !item.disabled && setActiveView(item.id)}
              className={clsx(
                'w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : item.disabled
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="px-4 py-3 border-t border-gray-200 text-xs text-gray-400">
        v1.0 &middot; Multi-Region
      </div>
    </aside>
  );
}

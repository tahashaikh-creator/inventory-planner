import { ChevronRight, RotateCcw } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export default function TopBar() {
  const { activeView, resetData } = useInventory();
  const viewLabels = { inventory: 'Frame Inventory', explorer: 'Historical Data', help: 'Help Center' };
  const viewLabel = viewLabels[activeView] || activeView;

  return (
    <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-6 shrink-0">
      <div>
        <h1 className="text-base font-semibold text-gray-900">Frame Stock Inventory</h1>
        <div className="flex items-center gap-1 text-xs text-gray-400 -mt-0.5">
          <span>Home</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-600">{viewLabel}</span>
        </div>
      </div>
      <button
        onClick={resetData}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-md px-3 py-1.5 hover:bg-gray-50 transition-colors"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Reset Data
      </button>
    </header>
  );
}

import clsx from 'clsx';
import { useInventory } from '../context/InventoryContext';

const OPTIONS = [
  { value: 'ALL', label: 'All Branches' },
  { value: 'US', label: 'US' },
  { value: 'UK', label: 'UK' },
  { value: 'DE', label: 'DE' },
];

export default function RegionFilter() {
  const { regionFilter, setRegionFilter } = useInventory();

  return (
    <div className="inline-flex rounded-lg border border-gray-200 bg-gray-100 p-0.5">
      {OPTIONS.map(opt => (
        <button
          key={opt.value}
          onClick={() => setRegionFilter(opt.value)}
          className={clsx(
            'px-3.5 py-1.5 text-sm font-medium rounded-md transition-all',
            regionFilter === opt.value
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

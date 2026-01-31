import { useState } from 'react';
import { Search } from 'lucide-react';
import clsx from 'clsx';
import { MONTH_NAMES, REGIONS } from '../data/generate';
import { useInventory } from '../context/InventoryContext';

export default function DataExplorer() {
  const { skus, records, updateHistory } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('US');

  const filteredSkus = skus.filter(s =>
    s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Historical Sales Data</h2>
          <p className="text-sm text-gray-500">Edit monthly sales to see real-time impact on forecasts and alerts.</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search SKU..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Region selector */}
        <div className="inline-flex rounded-lg border border-gray-200 bg-gray-100 p-0.5">
          {REGIONS.map(r => (
            <button
              key={r}
              onClick={() => setSelectedRegion(r)}
              className={clsx(
                'px-3.5 py-1.5 text-sm font-medium rounded-md transition-all',
                selectedRegion === r
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Matrix table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-2.5 text-left font-semibold text-gray-600 text-xs uppercase tracking-wider sticky left-0 bg-gray-50 z-10 min-w-[160px]">
                SKU Name
              </th>
              {MONTH_NAMES.map(name => (
                <th key={name} className="px-2 py-2.5 text-center font-semibold text-gray-600 text-xs uppercase tracking-wider min-w-[72px]">
                  {name}
                </th>
              ))}
              <th className="px-3 py-2.5 text-center font-semibold text-gray-600 text-xs uppercase tracking-wider bg-gray-100">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredSkus.map(sku => {
              const record = records.find(r => r.skuId === sku.id && r.region === selectedRegion);
              if (!record) return null;
              const total = record.history.reduce((a, b) => a + b, 0);

              return (
                <tr key={sku.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                  <td className="px-4 py-2 font-medium text-gray-900 sticky left-0 bg-white z-10">
                    {sku.id}
                  </td>
                  {record.history.map((val, monthIdx) => (
                    <td key={monthIdx} className="px-1 py-1.5 text-center">
                      <input
                        type="number"
                        value={val}
                        onChange={e => {
                          const v = Math.max(0, Number(e.target.value) || 0);
                          updateHistory(sku.id, selectedRegion, monthIdx, v);
                        }}
                        className={clsx(
                          'w-16 border rounded px-1.5 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
                          monthIdx >= 9 ? 'border-amber-200 bg-amber-50/50' : 'border-gray-200 bg-white'
                        )}
                      />
                    </td>
                  ))}
                  <td className="px-3 py-2 text-center font-semibold text-gray-700 bg-gray-50">
                    {total}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="px-4 py-2.5 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
          Editing {selectedRegion} region &middot; {filteredSkus.length} SKUs &middot; Q4 months highlighted
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { useInventory } from '../context/InventoryContext';
import StatusBadge from './StatusBadge';
import ExpandedRow from './ExpandedRow';

function EditableCell({ value, onChange, className = '' }) {
  return (
    <input
      type="number"
      value={value}
      onChange={e => onChange(Math.max(0, Number(e.target.value) || 0))}
      className={clsx(
        'w-16 border border-gray-200 rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white',
        className
      )}
    />
  );
}

export default function InventoryTable() {
  const {
    filteredRecords,
    regionFilter,
    searchQuery,
    setSearchQuery,
    updateRecord,
    updateSku,
  } = useInventory();

  const [expandedKey, setExpandedKey] = useState(null);
  const [selectedKeys, setSelectedKeys] = useState(new Set());

  const getKey = (r) => `${r.skuId}-${r.region}`;
  const showRegionCol = regionFilter === 'ALL';

  const toggleExpand = (key) => {
    setExpandedKey(prev => prev === key ? null : key);
  };

  const toggleSelect = (key) => {
    setSelectedKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedKeys.size === filteredRecords.length) {
      setSelectedKeys(new Set());
    } else {
      setSelectedKeys(new Set(filteredRecords.map(getKey)));
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Search bar */}
      <div className="px-4 py-3 border-b border-gray-200">
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
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-left">
              <th className="w-10 px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={selectedKeys.size === filteredRecords.length && filteredRecords.length > 0}
                  onChange={toggleAll}
                  className="rounded border-gray-300 accent-indigo-600"
                />
              </th>
              <th className="w-8 px-1 py-2.5"></th>
              <th className="px-3 py-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">SKU Name</th>
              {showRegionCol && (
                <th className="px-3 py-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Region</th>
              )}
              <th className="px-3 py-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wider text-center">Current Stock</th>
              <th className="px-3 py-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wider text-center">Active Orders</th>
              <th className="px-3 py-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wider text-center">Incoming POs</th>
              <th className="px-3 py-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wider text-center">MOQ</th>
              <th className="px-3 py-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wider text-center">Avg Daily</th>
              <th className="px-3 py-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wider text-center">Safety Stock</th>
              <th className="px-3 py-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wider text-center">ROP</th>
              <th className="px-3 py-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wider text-center">Net Avail.</th>
              <th className="px-3 py-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wider text-center">Status</th>
              <th className="px-3 py-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wider text-center">Suggested Order</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredRecords.map(record => {
                const key = getKey(record);
                const isExpanded = expandedKey === key;
                const isSelected = selectedKeys.has(key);
                const isCritical = record.status === 'CRITICAL' || record.status === 'STOCKOUT';

                return (
                  <AnimatePresence key={key}>
                    <tr
                      className={clsx(
                        'border-b border-gray-100 cursor-pointer transition-colors',
                        isCritical ? 'bg-red-50/50' : 'hover:bg-gray-50',
                        isExpanded && 'bg-indigo-50/30'
                      )}
                      onClick={() => toggleExpand(key)}
                    >
                      <td className="px-3 py-2" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(key)}
                          className="rounded border-gray-300 accent-indigo-600"
                        />
                      </td>
                      <td className="px-1 py-2 text-gray-400">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </td>
                      <td className="px-3 py-2 font-medium text-gray-900">{record.skuId}</td>
                      {showRegionCol && (
                        <td className="px-3 py-2">
                          <span className={clsx(
                            'inline-block px-2 py-0.5 rounded text-xs font-medium',
                            record.region === 'US' ? 'bg-blue-100 text-blue-700' :
                            record.region === 'UK' ? 'bg-purple-100 text-purple-700' :
                            'bg-orange-100 text-orange-700'
                          )}>
                            {record.region}
                          </span>
                        </td>
                      )}
                      <td className="px-3 py-2 text-center" onClick={e => e.stopPropagation()}>
                        <EditableCell
                          value={record.currentStock}
                          onChange={v => updateRecord(record.skuId, record.region, { currentStock: v })}
                        />
                      </td>
                      <td className="px-3 py-2 text-center" onClick={e => e.stopPropagation()}>
                        <EditableCell
                          value={record.activeOrders}
                          onChange={v => updateRecord(record.skuId, record.region, { activeOrders: v })}
                        />
                      </td>
                      <td className="px-3 py-2 text-center text-gray-600">{record.incomingStock}</td>
                      <td className="px-3 py-2 text-center" onClick={e => e.stopPropagation()}>
                        <EditableCell
                          value={record.moq}
                          onChange={v => updateSku(record.skuId, { moq: v })}
                        />
                      </td>
                      <td className="px-3 py-2 text-center text-gray-600">{record.dailyUsage.toFixed(1)}</td>
                      <td className="px-3 py-2 text-center text-gray-600">{record.safetyStock.toFixed(0)}</td>
                      <td className="px-3 py-2 text-center font-medium text-indigo-600">{record.rop.toFixed(0)}</td>
                      <td className={clsx(
                        'px-3 py-2 text-center font-medium',
                        record.netAvailability <= 0 ? 'text-red-600' : 'text-gray-900'
                      )}>
                        {record.netAvailability}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <StatusBadge status={record.status} />
                      </td>
                      <td className={clsx(
                        'px-3 py-2 text-center font-semibold',
                        record.suggestedOrder > 0 ? 'text-red-600' : 'text-gray-400'
                      )}>
                        {record.suggestedOrder > 0 ? record.suggestedOrder : '—'}
                      </td>
                    </tr>
                    {isExpanded && <ExpandedRow record={record} />}
                  </AnimatePresence>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
        Showing {filteredRecords.length} records
      </div>
    </div>
  );
}

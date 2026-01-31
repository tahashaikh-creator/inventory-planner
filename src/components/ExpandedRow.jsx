import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { MONTH_NAMES, DAYS_IN_MONTH } from '../data/generate';
import { useInventory } from '../context/InventoryContext';

export default function ExpandedRow({ record }) {
  const { simParams } = useInventory();
  const { month, day } = simParams;
  const leadTime = record.leadTime;

  // Determine which months fall in the forecast window
  const windowMonths = new Set();
  let daysLeft = leadTime;
  let m = month;
  const remainingInMonth = DAYS_IN_MONTH[m] - day + 1;

  if (remainingInMonth > 0 && daysLeft > 0) {
    windowMonths.add(m);
    daysLeft -= Math.min(daysLeft, remainingInMonth);
    m = (m + 1) % 12;
  }
  while (daysLeft > 0) {
    windowMonths.add(m);
    daysLeft -= Math.min(daysLeft, DAYS_IN_MONTH[m]);
    m = (m + 1) % 12;
  }

  const chartData = MONTH_NAMES.map((name, i) => ({
    name,
    sales: record.history[i],
    inWindow: windowMonths.has(i),
  }));

  return (
    <motion.tr
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
    >
      <td colSpan={99} className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <div className="grid grid-cols-2 gap-6">
          {/* Chart */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              12-Month Seasonality — {record.skuId} ({record.region})
            </h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="sales" radius={[3, 3, 0, 0]}>
                    {chartData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.inWindow ? '#4f46e5' : '#d1d5db'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Purple bars = months in the {leadTime}-day forecast window starting {MONTH_NAMES[month]} {day}
            </p>
          </div>

          {/* Math breakdown */}
          <div className="text-sm space-y-2">
            <h4 className="font-semibold text-gray-700">Calculation Breakdown</h4>
            <table className="w-full text-xs">
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-1.5 text-gray-500">Region</td>
                  <td className="py-1.5 font-medium text-right">{record.region}</td>
                </tr>
                <tr>
                  <td className="py-1.5 text-gray-500">Lead Time</td>
                  <td className="py-1.5 font-medium text-right">{record.leadTime} days</td>
                </tr>
                <tr>
                  <td className="py-1.5 text-gray-500">Seasonal Demand (pro-rated)</td>
                  <td className="py-1.5 font-medium text-right">{record.seasonalDemand.toFixed(1)} units</td>
                </tr>
                <tr>
                  <td className="py-1.5 text-gray-500">Forecast (with {simParams.growthPct}% growth)</td>
                  <td className="py-1.5 font-medium text-right">{record.forecast.toFixed(1)} units</td>
                </tr>
                <tr>
                  <td className="py-1.5 text-gray-500">Safety Stock ({simParams.safetyPct}%)</td>
                  <td className="py-1.5 font-medium text-right">{record.safetyStock.toFixed(1)} units</td>
                </tr>
                <tr className="font-semibold">
                  <td className="py-1.5 text-gray-700">Reorder Point (ROP)</td>
                  <td className="py-1.5 text-right text-indigo-600">{record.rop.toFixed(1)} units</td>
                </tr>
                <tr>
                  <td className="py-1.5 text-gray-500">Net Availability</td>
                  <td className="py-1.5 font-medium text-right">{record.netAvailability} units</td>
                </tr>
                <tr>
                  <td className="py-1.5 text-gray-500">Daily Usage</td>
                  <td className="py-1.5 font-medium text-right">{record.dailyUsage.toFixed(2)} units/day</td>
                </tr>
                <tr>
                  <td className="py-1.5 text-gray-500">Target Stock (ROP + 30d cycle)</td>
                  <td className="py-1.5 font-medium text-right">{record.targetStock.toFixed(1)} units</td>
                </tr>
                {record.suggestedOrder > 0 && (
                  <tr className="font-semibold">
                    <td className="py-1.5 text-red-600">Suggested Order (≥ MOQ {record.moq})</td>
                    <td className="py-1.5 text-right text-red-600">{record.suggestedOrder} units</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </td>
    </motion.tr>
  );
}

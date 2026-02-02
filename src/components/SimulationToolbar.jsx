import { Calendar, TrendingUp, Shield, Sun } from 'lucide-react';
import { MONTH_NAMES, DAYS_IN_MONTH } from '../data/generate';
import { useInventory } from '../context/InventoryContext';

export default function SimulationToolbar() {
  const {
    currentMonth, setCurrentMonth,
    simulationDay, setSimulationDay,
    growthPct, setGrowthPct,
    safetyPct, setSafetyPct,
  } = useInventory();

  const maxDay = DAYS_IN_MONTH[currentMonth];

  return (
    <div className="flex flex-wrap items-end gap-5 bg-white border border-gray-200 rounded-lg px-5 py-3.5">
      {/* Month */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" /> Sim Month
        </label>
        <select
          value={currentMonth}
          onChange={e => {
            const m = Number(e.target.value);
            setCurrentMonth(m);
            if (simulationDay > DAYS_IN_MONTH[m]) {
              setSimulationDay(DAYS_IN_MONTH[m]);
            }
          }}
          className="border border-gray-200 rounded-md px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {MONTH_NAMES.map((name, i) => (
            <option key={i} value={i}>{name}</option>
          ))}
        </select>
      </div>

      {/* Day */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
          <Sun className="w-3.5 h-3.5" /> Sim Day
        </label>
        <input
          type="number"
          min={1}
          max={maxDay}
          value={simulationDay}
          onChange={e => setSimulationDay(Math.max(1, Math.min(maxDay, Number(e.target.value) || 1)))}
          className="w-16 border border-gray-200 rounded-md px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Growth */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500 flex items-center gap-1" title="Fallback growth rate used for SKUs with insufficient historical data">
          <TrendingUp className="w-3.5 h-3.5" /> Default Growth %
        </label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={100}
            value={growthPct}
            onChange={e => setGrowthPct(Number(e.target.value))}
            className="w-24 accent-indigo-600"
          />
          <span className="text-sm font-medium text-gray-700 w-10 text-right">{growthPct}%</span>
        </div>
      </div>

      {/* Safety Stock */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
          <Shield className="w-3.5 h-3.5" /> Safety Factor
        </label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={100}
            value={safetyPct}
            onChange={e => setSafetyPct(Number(e.target.value))}
            className="w-24 accent-indigo-600"
          />
          <span className="text-sm font-medium text-gray-700 w-10 text-right">{safetyPct}%</span>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { ChevronDown, ChevronRight, BookOpen, Sliders, Calculator, AlertTriangle, Shield, TrendingUp, Calendar, Sun, Info } from 'lucide-react';

function Section({ icon: Icon, title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-5 py-3.5 bg-white hover:bg-gray-50 transition-colors text-left"
      >
        <Icon className="w-5 h-5 text-indigo-600 shrink-0" />
        <span className="text-sm font-semibold text-gray-900 flex-1">{title}</span>
        {open ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
      </button>
      {open && (
        <div className="px-5 py-4 bg-gray-50/50 border-t border-gray-200 text-sm text-gray-700 space-y-3 leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}

function Keyword({ children }) {
  return <span className="font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded text-xs">{children}</span>;
}

function Formula({ children }) {
  return (
    <div className="bg-gray-900 text-green-400 rounded-md px-4 py-2.5 font-mono text-xs leading-relaxed">
      {children}
    </div>
  );
}

export default function HelpCenter() {
  return (
    <div className="space-y-4 max-w-4xl">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Help Center</h2>
        <p className="text-sm text-gray-500 mt-1">
          How the forecasting engine works and what the numbers mean.
        </p>
      </div>

      {/* ── SYSTEM OVERVIEW ── */}
      <Section icon={BookOpen} title="What Does This System Do?" defaultOpen={true}>
        <p>
          Answers one question per SKU: <strong>"Given my current stock, incoming shipments, open orders, and seasonal demand — do I have enough inventory to last through the next lead-time window, and if not, how much should I order?"</strong>
        </p>
        <p>
          It uses 12 months of historical sales data to forecast demand, applies a growth multiplier and safety buffer, then compares your effective inventory against the calculated reorder point. The gap (if any) becomes your suggested order.
        </p>
      </Section>

      {/* ── SIMULATION CONTROLS ── */}
      <Section icon={Sliders} title="Simulation Controls">
        <p>The toolbar lets you run "what-if" scenarios. Every change instantly recalculates all metrics across every SKU.</p>

        <div className="space-y-3">
          <div className="bg-white border border-gray-200 rounded-md px-4 py-3 space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span className="font-semibold text-gray-900">Sim Month & Day</span>
            </div>
            <p>
              Sets the simulation start date. The system forecasts demand from this date forward through the lead-time window (40 days for US, 14 days for UK/DE). The month matters because seasonal demand varies — simulating in October pulls in high Q4 data, while February uses low winter demand.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-md px-4 py-3 space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span className="font-semibold text-gray-900">Growth % (default: 20%)</span>
            </div>
            <p>Year-over-year growth multiplier applied on top of historical seasonal demand.</p>
            <Formula>Forecast = Seasonal Demand × (1 + Growth% / 100)</Formula>
          </div>

          <div className="bg-white border border-gray-200 rounded-md px-4 py-3 space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-600" />
              <span className="font-semibold text-gray-900">Safety Factor % (default: 50%)</span>
            </div>
            <p>Buffer on top of the forecast to protect against demand spikes or supplier delays.</p>
            <Formula>Safety Stock = Forecast × (Safety Factor% / 100)</Formula>
            <p>Lower it (20-30%) for reliable suppliers. Raise it for volatile demand or unreliable shipping.</p>
          </div>
        </div>
      </Section>

      {/* ── CORE CALCULATION ENGINE ── */}
      <Section icon={Calculator} title="The Calculation Pipeline">
        <p>This runs for every SKU-region record whenever any parameter changes:</p>

        <div className="space-y-3">
          <div className="bg-white border border-gray-200 rounded-md px-4 py-3 space-y-2">
            <strong>1. Pro-Rated Seasonal Demand</strong>
            <p>
              Walks day-by-day through the lead-time window, pulling each month's historical sales and pro-rating by the number of days used from that month.
            </p>
            <Formula>
              For each month in the window:{'\n'}
              Daily Rate = Monthly Sales ÷ Days in Month{'\n'}
              Demand += Daily Rate × Days Used From That Month
            </Formula>
            <p className="text-xs text-gray-500">
              Example: Window Oct 15 – Nov 24 (40 days). Oct sales=200 → 200/31 × 17 = 109.6. Nov sales=180 → 180/30 × 23 = 138.0. Total = 247.6 units.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-md px-4 py-3">
            <strong>2. Forecast</strong>
            <Formula>Forecast = Seasonal Demand × (1 + Growth% / 100)</Formula>
          </div>

          <div className="bg-white border border-gray-200 rounded-md px-4 py-3">
            <strong>3. Safety Stock</strong>
            <Formula>Safety Stock = Forecast × (Safety Factor% / 100)</Formula>
          </div>

          <div className="bg-white border border-gray-200 rounded-md px-4 py-3">
            <strong>4. Reorder Point (ROP)</strong>
            <Formula>ROP = Forecast + Safety Stock</Formula>
            <p>The threshold your net availability is compared against to determine status.</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-md px-4 py-3">
            <strong>5. Net Availability</strong>
            <Formula>Net Availability = Current Stock + Incoming POs − Active Orders</Formula>
          </div>

          <div className="bg-white border border-gray-200 rounded-md px-4 py-3">
            <strong>6. Suggested Order (only when deficit exists)</strong>
            <Formula>
              Target Stock = ROP + (Avg Daily × 30){'\n'}
              Deficit = Target Stock − Net Availability{'\n'}
              Suggested Order = max(MOQ, ceil(Deficit))
            </Formula>
            <p>The 30-day cycle buffer means you order enough for a full month of runway beyond the reorder point. The order is always at least the MOQ.</p>
          </div>
        </div>
      </Section>

      {/* ── STATUS SYSTEM ── */}
      <Section icon={AlertTriangle} title="Status Thresholds">
        <p>Each SKU's status is determined by comparing <Keyword>Net Availability</Keyword> against <Keyword>ROP</Keyword>:</p>
        <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-2 text-left font-semibold text-gray-600 text-xs uppercase">Status</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-600 text-xs uppercase">Condition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="px-4 py-2"><span className="bg-red-600 text-white px-2 py-0.5 rounded-full text-xs font-semibold">STOCKOUT</span></td>
                <td className="px-4 py-2 font-mono text-xs">Net Availability &le; 0</td>
              </tr>
              <tr>
                <td className="px-4 py-2"><span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-semibold">CRITICAL</span></td>
                <td className="px-4 py-2 font-mono text-xs">Net Availability &le; ROP</td>
              </tr>
              <tr>
                <td className="px-4 py-2"><span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-semibold">WARNING</span></td>
                <td className="px-4 py-2 font-mono text-xs">Net Availability &le; ROP × 1.25</td>
              </tr>
              <tr>
                <td className="px-4 py-2"><span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold">HEALTHY</span></td>
                <td className="px-4 py-2 font-mono text-xs">Net Availability &gt; ROP × 1.25</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      {/* ── LEAD TIMES ── */}
      <Section icon={Info} title="Lead Times & Key Defaults">
        <div className="space-y-3">
          <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-2 text-left font-semibold text-gray-600 text-xs uppercase">Region</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-600 text-xs uppercase">Lead Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="px-4 py-2"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">US</span></td>
                  <td className="px-4 py-2 font-semibold">40 days (ocean freight)</td>
                </tr>
                <tr>
                  <td className="px-4 py-2"><span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-medium">UK</span></td>
                  <td className="px-4 py-2 font-semibold">14 days (European shipping)</td>
                </tr>
                <tr>
                  <td className="px-4 py-2"><span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs font-medium">DE</span></td>
                  <td className="px-4 py-2 font-semibold">14 days (European shipping)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Longer lead time = larger forecast window = higher ROP. US items are almost always in worse shape than UK/DE with the same stock levels because you're planning 40 days ahead instead of 14.
          </p>
          <p>
            <strong>Q4 seasonality:</strong> Oct/Nov/Dec have ~2x the base demand in historical data. Simulate these months early (August/September) to place orders before the lead time catches up — especially for US.
          </p>
        </div>
      </Section>

      {/* ── EDITABLE FIELDS ── */}
      <Section icon={Sun} title="What You Can Edit">
        <p>These fields are editable inline and changes ripple through all calculations instantly:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Current Stock</strong> — Units in warehouse. Affects Net Availability.</li>
          <li><strong>Active Orders</strong> — Committed customer orders. Subtracted from Net Availability.</li>
          <li><strong>MOQ</strong> — Minimum order quantity. Floors the Suggested Order.</li>
          <li><strong>Historical sales data</strong> (in Historical Data tab) — The 12-month matrix that drives seasonal demand. Editing any cell recalculates forecasts, ROP, statuses, and suggested orders system-wide.</li>
        </ul>
      </Section>

      <div className="text-xs text-gray-400 pt-2 pb-4">
        FrameStock Inventory Planner v1.0 &middot; Multi-Region &middot; Help Center
      </div>
    </div>
  );
}

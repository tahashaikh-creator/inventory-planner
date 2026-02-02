const REGIONS = ['US', 'UK', 'DE'];
const LEAD_TIMES = { US: 40, UK: 14, DE: 14 };
const MOQ_OPTIONS = [10, 25, 50, 100, 200];
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const FRAME_SIZES = [
  '10x10','12x12','14x14','16x16','16x20',
  '18x18','18x24','20x20','20x24','20x28',
  '22x22','24x24','24x30','24x36','28x28',
  '30x30','30x40','36x36','36x48','40x40',
];

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Regional trend multipliers: how much "this year" differs from "last year"
const REGION_TRENDS = { US: 1.30, UK: 1.10, DE: 0.95 };

function generateHistory(isUS) {
  const baseMultiplier = isUS ? 2 : 1;
  return Array.from({ length: 12 }, (_, month) => {
    const base = randInt(20, 80) * baseMultiplier;
    // Q4 (Oct=9, Nov=10, Dec=11) gets 2x boost
    const seasonal = month >= 9 ? base * 2 : base;
    return seasonal;
  });
}

/**
 * Generate "recent" (current year) history from last year's history,
 * applying a regional trend plus per-month noise (±15%).
 */
function generateRecentHistory(lastYearHistory, region) {
  const trend = REGION_TRENDS[region] || 1.0;
  return lastYearHistory.map(monthSales => {
    const noise = 0.85 + Math.random() * 0.30; // 0.85 – 1.15
    return Math.round(monthSales * trend * noise);
  });
}

function generateSKUs() {
  return FRAME_SIZES.map((size, i) => ({
    id: `FRAME-${size}`,
    index: i,
    moq: MOQ_OPTIONS[randInt(0, MOQ_OPTIONS.length - 1)],
  }));
}

function generateInventoryRecords(skus) {
  const records = [];
  for (const sku of skus) {
    for (const region of REGIONS) {
      const isUS = region === 'US';
      const stockMultiplier = isUS ? 2 : 1;
      const lastYearHistory = generateHistory(isUS);
      const recentHistory = generateRecentHistory(lastYearHistory, region);
      records.push({
        skuId: sku.id,
        region,
        currentStock: randInt(0, 200) * stockMultiplier,
        incomingStock: randInt(0, 100) * stockMultiplier,
        activeOrders: randInt(0, 50) * stockMultiplier,
        history: lastYearHistory,
        recentHistory,
      });
    }
  }
  return records;
}

export function generateInitialData() {
  const skus = generateSKUs();
  const records = generateInventoryRecords(skus);
  return { skus, records };
}

export { REGIONS, LEAD_TIMES, DAYS_IN_MONTH, MONTH_NAMES, MOQ_OPTIONS, REGION_TRENDS };

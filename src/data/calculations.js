import { LEAD_TIMES, DAYS_IN_MONTH } from './generate';

/**
 * Pro-rate seasonal demand across a lead-time window starting at (month, day).
 * history: array of 12 monthly totals (Jan=0 ... Dec=11)
 * month: 0-based month index (0=Jan)
 * day: 1-based day of month (simulation day)
 * leadTimeDays: number of days to cover
 *
 * Returns total units expected to sell in the lead-time window.
 */
export function getSeasonalDemand(history, month, day, leadTimeDays) {
  const daysInCurrentMonth = DAYS_IN_MONTH[month];
  // Days remaining in the starting month (including the start day)
  const remainingInMonth = daysInCurrentMonth - day + 1;

  let totalDemand = 0;
  let daysLeft = leadTimeDays;
  let m = month;

  if (remainingInMonth > 0 && daysLeft > 0) {
    const daysToUse = Math.min(daysLeft, remainingInMonth);
    const dailyRate = history[m] / DAYS_IN_MONTH[m];
    totalDemand += dailyRate * daysToUse;
    daysLeft -= daysToUse;
    m = (m + 1) % 12;
  }

  // Walk through subsequent full/partial months
  while (daysLeft > 0) {
    const daysInM = DAYS_IN_MONTH[m];
    const daysToUse = Math.min(daysLeft, daysInM);
    const dailyRate = history[m] / daysInM;
    totalDemand += dailyRate * daysToUse;
    daysLeft -= daysToUse;
    m = (m + 1) % 12;
  }

  return totalDemand;
}

/**
 * Calculate all derived metrics for a single inventory record.
 */
export function calculateMetrics(record, sku, { month, day, growthPct, safetyPct }) {
  const region = record.region;
  const leadTime = LEAD_TIMES[region];

  const seasonalDemand = getSeasonalDemand(record.history, month, day, leadTime);
  const forecast = seasonalDemand * (1 + growthPct / 100);
  const safetyStock = forecast * (safetyPct / 100);
  const rop = forecast + safetyStock;

  const netAvailability = record.currentStock + record.incomingStock - record.activeOrders;

  // Daily usage based on lead-time window
  const dailyUsage = forecast / leadTime;
  const targetStock = rop + dailyUsage * 30; // 30-day cycle stock
  const deficit = targetStock - netAvailability;
  const suggestedOrder = Math.max(sku.moq, Math.ceil(deficit));
  const needsOrder = deficit > 0;

  let status;
  if (netAvailability <= 0) {
    status = 'STOCKOUT';
  } else if (netAvailability <= rop) {
    status = 'CRITICAL';
  } else if (netAvailability <= rop * 1.25) {
    status = 'WARNING';
  } else {
    status = 'HEALTHY';
  }

  return {
    leadTime,
    seasonalDemand: Math.round(seasonalDemand * 100) / 100,
    forecast: Math.round(forecast * 100) / 100,
    safetyStock: Math.round(safetyStock * 100) / 100,
    rop: Math.round(rop * 100) / 100,
    netAvailability,
    dailyUsage: Math.round(dailyUsage * 100) / 100,
    targetStock: Math.round(targetStock * 100) / 100,
    suggestedOrder: needsOrder ? suggestedOrder : 0,
    status,
  };
}

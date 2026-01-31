import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { generateInitialData } from '../data/generate';
import { calculateMetrics } from '../data/calculations';

const InventoryContext = createContext(null);

const STORAGE_KEY = 'inventory-planner-state';

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function getInitialState() {
  const stored = loadFromStorage();
  if (stored && stored.skus && stored.records) {
    return stored;
  }
  return generateInitialData();
}

export function InventoryProvider({ children }) {
  const [data, setData] = useState(getInitialState);
  const [regionFilter, setRegionFilter] = useState('ALL');
  const [currentMonth, setCurrentMonth] = useState(9); // October
  const [simulationDay, setSimulationDay] = useState(1);
  const [growthPct, setGrowthPct] = useState(20);
  const [safetyPct, setSafetyPct] = useState(50);
  const [activeView, setActiveView] = useState('inventory'); // 'inventory' | 'explorer' | 'help'
  const [searchQuery, setSearchQuery] = useState('');

  const persist = useCallback((newData) => {
    setData(newData);
    saveToStorage(newData);
  }, []);

  const updateRecord = useCallback((skuId, region, updates) => {
    setData(prev => {
      const next = {
        ...prev,
        records: prev.records.map(r =>
          r.skuId === skuId && r.region === region ? { ...r, ...updates } : r
        ),
      };
      saveToStorage(next);
      return next;
    });
  }, []);

  const updateSku = useCallback((skuId, updates) => {
    setData(prev => {
      const next = {
        ...prev,
        skus: prev.skus.map(s =>
          s.id === skuId ? { ...s, ...updates } : s
        ),
      };
      saveToStorage(next);
      return next;
    });
  }, []);

  const updateHistory = useCallback((skuId, region, monthIndex, value) => {
    setData(prev => {
      const next = {
        ...prev,
        records: prev.records.map(r => {
          if (r.skuId === skuId && r.region === region) {
            const newHistory = [...r.history];
            newHistory[monthIndex] = value;
            return { ...r, history: newHistory };
          }
          return r;
        }),
      };
      saveToStorage(next);
      return next;
    });
  }, []);

  const resetData = useCallback(() => {
    const fresh = generateInitialData();
    persist(fresh);
  }, [persist]);

  const simParams = useMemo(() => ({
    month: currentMonth,
    day: simulationDay,
    growthPct,
    safetyPct,
  }), [currentMonth, simulationDay, growthPct, safetyPct]);

  // Compute all metrics
  const enrichedRecords = useMemo(() => {
    return data.records.map(record => {
      const sku = data.skus.find(s => s.id === record.skuId);
      const metrics = calculateMetrics(record, sku, simParams);
      return { ...record, ...metrics, moq: sku.moq };
    });
  }, [data, simParams]);

  // Apply filters
  const filteredRecords = useMemo(() => {
    let filtered = enrichedRecords;
    if (regionFilter !== 'ALL') {
      filtered = filtered.filter(r => r.region === regionFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(r => r.skuId.toLowerCase().includes(q));
    }
    return filtered;
  }, [enrichedRecords, regionFilter, searchQuery]);

  // KPI summaries
  const kpis = useMemo(() => {
    const toOrder = filteredRecords.filter(r => r.suggestedOrder > 0).length;
    const stockoutRisk = filteredRecords.filter(r => r.status === 'STOCKOUT' || r.status === 'CRITICAL').length;
    const healthy = filteredRecords.filter(r => r.status === 'HEALTHY').length;
    const warning = filteredRecords.filter(r => r.status === 'WARNING').length;
    return { toOrder, stockoutRisk, healthy, warning, total: filteredRecords.length };
  }, [filteredRecords]);

  const value = {
    skus: data.skus,
    records: data.records,
    enrichedRecords,
    filteredRecords,
    kpis,
    regionFilter, setRegionFilter,
    currentMonth, setCurrentMonth,
    simulationDay, setSimulationDay,
    growthPct, setGrowthPct,
    safetyPct, setSafetyPct,
    activeView, setActiveView,
    searchQuery, setSearchQuery,
    updateRecord,
    updateSku,
    updateHistory,
    resetData,
    simParams,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventory must be used within InventoryProvider');
  return ctx;
}

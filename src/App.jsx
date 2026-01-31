import { InventoryProvider, useInventory } from './context/InventoryContext';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import RegionFilter from './components/RegionFilter';
import SimulationToolbar from './components/SimulationToolbar';
import KPICards from './components/KPICards';
import InventoryTable from './components/InventoryTable';
import DataExplorer from './components/DataExplorer';
import HelpCenter from './components/HelpCenter';

function MainContent() {
  const { activeView } = useInventory();

  return (
    <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
      <TopBar />
      <main className="flex-1 overflow-y-auto p-6 space-y-5">
        {activeView === 'inventory' && (
          <>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <RegionFilter />
            </div>
            <SimulationToolbar />
            <KPICards />
            <InventoryTable />
          </>
        )}
        {activeView === 'explorer' && <DataExplorer />}
        {activeView === 'help' && <HelpCenter />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <InventoryProvider>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <MainContent />
      </div>
    </InventoryProvider>
  );
}

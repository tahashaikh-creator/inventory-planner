import { ShoppingCart, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import { useInventory } from '../context/InventoryContext';

export default function KPICards() {
  const { kpis } = useInventory();

  const cards = [
    {
      label: 'Items to Order',
      value: kpis.toOrder,
      icon: ShoppingCart,
      color: 'red',
    },
    {
      label: 'Stockout Risk',
      value: kpis.stockoutRisk,
      icon: AlertTriangle,
      color: 'amber',
    },
    {
      label: 'Warning',
      value: kpis.warning,
      icon: AlertCircle,
      color: 'yellow',
    },
    {
      label: 'Healthy Stock',
      value: kpis.healthy,
      icon: CheckCircle,
      color: 'green',
    },
  ];

  const colorMap = {
    red:    'border-red-200 bg-red-50 text-red-700',
    amber:  'border-amber-200 bg-amber-50 text-amber-700',
    yellow: 'border-yellow-200 bg-yellow-50 text-yellow-700',
    green:  'border-green-200 bg-green-50 text-green-700',
  };

  const iconColorMap = {
    red: 'text-red-500',
    amber: 'text-amber-500',
    yellow: 'text-yellow-500',
    green: 'text-green-500',
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map(card => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={clsx(
              'border rounded-lg px-4 py-3 flex items-center gap-3',
              colorMap[card.color]
            )}
          >
            <Icon className={clsx('w-8 h-8', iconColorMap[card.color])} />
            <div>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="text-xs font-medium opacity-80">{card.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

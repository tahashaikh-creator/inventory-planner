import clsx from 'clsx';

const STYLES = {
  STOCKOUT: 'bg-red-600 text-white',
  CRITICAL: 'bg-red-100 text-red-700',
  WARNING:  'bg-amber-100 text-amber-700',
  HEALTHY:  'bg-green-100 text-green-700',
};

export default function StatusBadge({ status }) {
  return (
    <span className={clsx(
      'inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold',
      STYLES[status] || 'bg-gray-100 text-gray-600'
    )}>
      {status}
    </span>
  );
}

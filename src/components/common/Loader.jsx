export default function Loader({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-accent-green/20"/>
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent-green animate-spin"/>
        <div className="absolute inset-2 rounded-full border border-accent-green/20"/>
      </div>
      <p className="text-slate-500 text-sm font-body">{text}</p>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-bg-primary flex items-center justify-center z-50">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full border-2 border-accent-green/20"/>
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent-green animate-spin"/>
        </div>
        <p className="font-display font-bold text-accent-green text-lg tracking-wider">SmartPOS Pro</p>
        <p className="text-slate-600 text-xs mt-1 font-body">Initializing system...</p>
      </div>
    </div>
  );
}

export function SkeletonRow({ cols = 5 }) {
  return (
    <tr>
      {[...Array(cols)].map((_, i) => (
        <td key={i} className="td">
          <div className="skeleton h-4 rounded" style={{ width: `${60 + Math.random() * 30}%` }}/>
        </td>
      ))}
    </tr>
  );
}

export function StatSkeleton() {
  return <div className="stat-card h-32 skeleton"/>;
}

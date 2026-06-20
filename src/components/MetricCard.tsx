interface MetricCardProps {
  value: string | number;
  label: string;
  trend?: string;
  trendUp?: boolean;
}

export function MetricCard({ value, label, trend, trendUp }: MetricCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="text-2xl font-extrabold text-[var(--blue)] leading-tight">{value}</div>
      <div className="text-gray-500 text-sm mt-1">{label}</div>
      {trend && (
        <div className={`text-xs font-semibold mt-1.5 ${trendUp ? "text-green-600" : "text-red-600"}`}>
          {trend}
        </div>
      )}
    </div>
  );
}

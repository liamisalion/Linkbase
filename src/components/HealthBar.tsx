"use client";

export function HealthBar({ score, size = "md" }: { score: number; size?: "sm" | "md" }) {
  const color = score >= 75 ? "bg-green-500" : score >= 50 ? "bg-yellow-500" : "bg-red-500";
  const textColor = score >= 75 ? "text-green-600" : score >= 50 ? "text-yellow-600" : "text-red-600";
  const label = score >= 85 ? "关系活跃" : score >= 70 ? "关系良好" : score >= 50 ? "需要关注" : "关系冷却";
  const h = size === "sm" ? "h-1.5" : "h-2";

  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 ${h} bg-gray-200 rounded-full overflow-hidden`}>
        <div className={`${h} ${color} rounded-full transition-all duration-500`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-sm font-bold ${textColor} min-w-[28px] text-right`}>{score}</span>
      {size === "md" && <span className="text-xs text-gray-400">{label}</span>}
    </div>
  );
}

const colorMap: Record<string, string> = {
  red: "bg-red-50 text-red-700",
  yellow: "bg-yellow-50 text-yellow-700",
  green: "bg-green-50 text-green-700",
  blue: "bg-blue-50 text-[var(--blue)]",
  purple: "bg-purple-50 text-purple-700",
  gray: "bg-gray-100 text-gray-600",
};

export function Tag({ children, color = "blue" }: { children: React.ReactNode; color?: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap ${colorMap[color] || colorMap.blue}`}>
      {children}
    </span>
  );
}

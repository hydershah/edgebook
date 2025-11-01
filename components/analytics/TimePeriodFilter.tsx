"use client";

interface TimePeriodFilterProps {
  selected: "7d" | "30d" | "3mo" | "1yr" | "all";
  onChange: (period: "7d" | "30d" | "3mo" | "1yr" | "all") => void;
}

export default function TimePeriodFilter({
  selected,
  onChange,
}: TimePeriodFilterProps) {
  const periods: Array<{ value: "7d" | "30d" | "3mo" | "1yr" | "all"; label: string }> = [
    { value: "7d", label: "7D" },
    { value: "30d", label: "30D" },
    { value: "3mo", label: "3M" },
    { value: "1yr", label: "1Y" },
    { value: "all", label: "All" },
  ];

  return (
    <div className="inline-flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
      {periods.map((period) => (
        <button
          key={period.value}
          onClick={() => onChange(period.value)}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
            selected === period.value
              ? "bg-white text-primary shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
}

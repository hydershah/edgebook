"use client";

interface CalendarDay {
  date: string;
  picks: number;
  won: number;
  lost: number;
  winRate: number;
  level: 0 | 1 | 2 | 3 | 4;
}

interface CalendarHeatmapProps {
  data: CalendarDay[];
  startDate: Date;
  endDate: Date;
}

export default function CalendarHeatmap({
  data,
  startDate,
  endDate,
}: CalendarHeatmapProps) {
  const getColorClass = (level: 0 | 1 | 2 | 3 | 4) => {
    switch (level) {
      case 0:
        return "bg-gray-100 hover:bg-gray-200";
      case 1:
        return "bg-primary/20 hover:bg-primary/30";
      case 2:
        return "bg-primary/40 hover:bg-primary/50";
      case 3:
        return "bg-primary/60 hover:bg-primary/70";
      case 4:
        return "bg-primary/80 hover:bg-primary/90";
    }
  };

  // Group data by week
  const weeks: CalendarDay[][] = [];
  let currentWeek: CalendarDay[] = [];

  data.forEach((day, index) => {
    const dayOfWeek = new Date(day.date).getDay();

    if (dayOfWeek === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }

    currentWeek.push(day);

    if (index === data.length - 1) {
      weeks.push(currentWeek);
    }
  });

  const monthLabels: Array<{ month: string; position: number }> = [];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  let lastMonth = -1;
  weeks.forEach((week, weekIndex) => {
    const firstDay = new Date(week[0].date);
    const month = firstDay.getMonth();

    if (month !== lastMonth) {
      monthLabels.push({
        month: months[month],
        position: weekIndex,
      });
      lastMonth = month;
    }
  });

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg shadow-black/5">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Activity Calendar</h3>
        <p className="text-sm text-gray-600">
          Your pick activity over the past year
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Month labels */}
          <div className="flex gap-1 mb-2 ml-8">
            {monthLabels.map((label) => (
              <div
                key={label.position}
                className="text-xs text-gray-600 font-medium"
                style={{ marginLeft: `${label.position * 14}px` }}
              >
                {label.month}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          <div className="flex gap-1">
            {/* Day of week labels */}
            <div className="flex flex-col gap-1 text-xs text-gray-600 font-medium pr-2">
              <div className="h-3">Sun</div>
              <div className="h-3">Mon</div>
              <div className="h-3">Tue</div>
              <div className="h-3">Wed</div>
              <div className="h-3">Thu</div>
              <div className="h-3">Fri</div>
              <div className="h-3">Sat</div>
            </div>

            {/* Weeks */}
            <div className="flex gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {Array.from({ length: 7 }).map((_, dayIndex) => {
                    const day = week.find(
                      (d) => new Date(d.date).getDay() === dayIndex
                    );

                    if (!day) {
                      return <div key={dayIndex} className="w-3 h-3" />;
                    }

                    return (
                      <div
                        key={day.date}
                        className={`w-3 h-3 rounded-sm cursor-pointer transition-colors group relative ${getColorClass(
                          day.level
                        )}`}
                        title={`${new Date(day.date).toLocaleDateString()}: ${
                          day.picks
                        } picks${
                          day.picks > 0
                            ? `, ${day.winRate}% win rate (${day.won}-${day.lost})`
                            : ""
                        }`}
                      >
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          <div className="font-medium">
                            {new Date(day.date).toLocaleDateString()}
                          </div>
                          {day.picks > 0 ? (
                            <>
                              <div>{day.picks} picks</div>
                              <div>
                                {day.won}W - {day.lost}L ({day.winRate}%)
                              </div>
                            </>
                          ) : (
                            <div>No picks</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-4 text-xs text-gray-600">
            <span>Less</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`w-3 h-3 rounded-sm ${getColorClass(
                    level as 0 | 1 | 2 | 3 | 4
                  )}`}
                />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}

import { getAnalytics } from "@/app/actions/analytics";
import StatusChart      from "@/components/analytics/status-chart";
import PriorityChart    from "@/components/analytics/priority-chart";
import ActivityChart    from "@/components/analytics/activity-chart";

export default async function AnalyticsPage() {
  const data = await getAnalytics();

  const statCards = [
    { label: "Total tasks",    value: data.stats.total,   sub: "across all projects",                    danger: false },
    { label: "Completed",      value: data.stats.done,    sub: `${data.stats.completionRate}% done`,     danger: false },
    { label: "Overdue",        value: data.stats.overdue, sub: "need attention",                         danger: true  },
    // fixed: was using data.completed which doesn't exist; fixed missing comma
    { label: "Done this week", value: data.activityByDay.reduce((a, d) => a + d.completed, 0), sub: "last 7 days", danger: false },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-6 py-4 border-b border-white/10">
        <h1 className="text-lg font-semibold">Analytics</h1>
      </div>

      <div className="p-6 flex flex-col gap-6">
        <div className="grid grid-cols-4 gap-4">
          {statCards.map((s) => (
            <div key={s.label} className="bg-gray-800/60 border border-white/10 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className={`text-3xl font-semibold tracking-tight ${
                s.danger && s.value > 0 ? "text-red-400" : "text-white"
              }`}>
                {s.value}
              </p>
              <p className="text-xs text-gray-600 mt-1">{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1 bg-gray-800/60 border border-white/10 rounded-xl p-5">
            <p className="text-sm font-medium text-gray-300 mb-4">Tasks by status</p>
            <StatusChart data={data.tasksByStatus} />
          </div>
          <div className="col-span-1 bg-gray-800/60 border border-white/10 rounded-xl p-5">
            <p className="text-sm font-medium text-gray-300 mb-4">Tasks by priority</p>
            <PriorityChart data={data.tasksByPriority} />
          </div>
          <div className="col-span-1 bg-gray-800/60 border border-white/10 rounded-xl p-5">
            <p className="text-sm font-medium text-gray-300 mb-4">Completions — last 7 days</p>
            <ActivityChart data={data.activityByDay} />
          </div>
        </div>
      </div>
    </div>
  );
}
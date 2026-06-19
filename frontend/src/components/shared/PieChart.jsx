import { PieChart as RechartsPie, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["#065299", "#d06c38", "#BE9337", "#22C55E", "#EF4444", "#8B5CF6"];

export function PieChartWidget({ data, title, dataKey = "value", nameKey = "name" }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
      {title && <h3 className="text-sm font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={260}>
        <RechartsPie>
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={3}
            strokeWidth={0}
          >
            {data?.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              color: "var(--foreground)",
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px", color: "var(--muted-foreground)" }}
          />
        </RechartsPie>
      </ResponsiveContainer>
    </div>
  );
}

"use client";

type ChartPoint = {
  label: string;
  value?: number;
  workoutMinutes?: number;
  entries?: number;
  averageSleepHours?: number;
};

const colors = ["#5f8ff5", "#0f8a5f", "#d78a18", "#8b5cf6", "#d94747"];

export function BarChart({ data, valueKey = "value" }: { data: ChartPoint[]; valueKey?: keyof ChartPoint }) {
  const max = Math.max(...data.map((item) => Number(item[valueKey] || 0)), 1);

  return (
    <div>
      <svg className="chart" viewBox="0 0 680 260" role="img">
        <line x1="38" y1="220" x2="650" y2="220" stroke="#dce3ee" />
        {data.map((item, index) => {
          const width = 42;
          const gap = data.length > 1 ? (570 - width * data.length) / Math.max(data.length - 1, 1) : 0;
          const x = 54 + index * (width + Math.max(gap, 12));
          const value = Number(item[valueKey] || 0);
          const height = (value / max) * 170;
          return (
            <g key={`${item.label}-${index}`}>
              <rect x={x} y={220 - height} width={width} height={height} rx="6" fill={colors[index % colors.length]} />
              <text x={x + width / 2} y="244" textAnchor="middle" fontSize="13" fill="#6b7482">
                {item.label}
              </text>
              <text x={x + width / 2} y={210 - height} textAnchor="middle" fontSize="13" fontWeight="800" fill="#17202f">
                {value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function LineChart({ data }: { data: ChartPoint[] }) {
  const values = data.map((item) => Number(item.workoutMinutes || 0));
  const max = Math.max(...values, 1);
  const points = data.map((item, index) => {
    const x = 44 + (index / Math.max(data.length - 1, 1)) * 590;
    const y = 216 - (Number(item.workoutMinutes || 0) / max) * 160;
    return { x, y, item };
  });
  const polyline = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <svg className="chart" viewBox="0 0 680 260" role="img">
      {[0, 1, 2, 3].map((line) => (
        <line key={line} x1="38" y1={56 + line * 53} x2="650" y2={56 + line * 53} stroke="#eef3fb" />
      ))}
      <polyline fill="none" stroke="#5f8ff5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" points={polyline} />
      {points.map((point, index) => (
        <g key={`${point.item.label}-${index}`}>
          <circle cx={point.x} cy={point.y} r="5" fill="#316ce8" />
          <text x={point.x} y="244" textAnchor="middle" fontSize="12" fill="#6b7482">
            {point.item.label}
          </text>
          <text x={point.x} y={point.y - 12} textAnchor="middle" fontSize="12" fontWeight="800" fill="#17202f">
            {point.item.workoutMinutes || 0}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function DonutChart({ data }: { data: ChartPoint[] }) {
  const total = data.reduce((sum, item) => sum + Number(item.value || 0), 0) || 1;
  let offset = 25;

  return (
    <div>
      <svg className="chart" viewBox="0 0 320 260" role="img">
        <circle cx="160" cy="122" r="76" fill="none" stroke="#eef3fb" strokeWidth="34" />
        {data.map((item, index) => {
          const value = Number(item.value || 0);
          const dash = (value / total) * 100;
          const segment = (
            <circle
              cx="160"
              cy="122"
              fill="none"
              key={`${item.label}-${index}`}
              r="76"
              stroke={colors[index % colors.length]}
              strokeDasharray={`${dash} ${100 - dash}`}
              strokeDashoffset={offset}
              strokeLinecap="round"
              strokeWidth="34"
              transform="rotate(-90 160 122)"
            />
          );
          offset -= dash;
          return segment;
        })}
        <text x="160" y="116" textAnchor="middle" fontSize="30" fontWeight="900" fill="#17202f">
          {total}
        </text>
        <text x="160" y="142" textAnchor="middle" fontSize="13" fontWeight="800" fill="#6b7482">
          Total
        </text>
      </svg>
      <div className="chart-labels">
        {data.map((item, index) => (
          <span className="legend" key={item.label}>
            <span className="dot" style={{ background: colors[index % colors.length] }} />
            {item.label}: {item.value || 0}
          </span>
        ))}
      </div>
    </div>
  );
}

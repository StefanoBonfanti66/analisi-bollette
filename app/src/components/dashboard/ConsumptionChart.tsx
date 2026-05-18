import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Bill, BillType } from '../../types';
import { cn } from '../../lib/utils';

interface ConsumptionChartProps {
  bills: Bill[];
  type: BillType;
  metric?: 'consumption' | 'totalAmount' | 'unitCost';
}

export default function ConsumptionChart({ bills, type, metric = 'consumption' }: ConsumptionChartProps) {
  const data = bills
    .filter(b => b.type === type)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(b => ({
      name: b.periodLabel.split(' ')[0],
      value: b[metric],
      fullLabel: b.periodLabel,
    }));

  if (data.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 italic text-sm">
        Carica almeno una bolletta per visualizzare i grafici.
      </div>
    );
  }

  const formatValue = (val: number) => {
    if (metric === 'totalAmount') return `${val.toFixed(2)} €`;
    if (metric === 'unitCost') return `${val.toFixed(4)} €/${type === 'LUCE' ? 'kWh' : 'Smc'}`;
    return `${val} ${type === 'LUCE' ? 'kWh' : 'Smc'}`;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id={`${type}-gradient-${metric}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={type === 'LUCE' ? '#f59e0b' : '#3b82f6'} stopOpacity={0.1} />
            <stop offset="95%" stopColor={type === 'LUCE' ? '#f59e0b' : '#3b82f6'} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: '#cbd5e1', fontWeight: 600 }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: '#cbd5e1', fontWeight: 600 }}
          tickFormatter={(val) => metric === 'totalAmount' ? `${val}€` : val}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-white p-3 rounded-xl border-none shadow-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    {payload[0].payload.fullLabel}
                  </p>
                  <p className={cn(
                    "text-sm font-black",
                    type === 'LUCE' ? "text-amber-500" : "text-blue-500"
                  )}>
                    {formatValue(payload[0].value as number)}
                  </p>
                </div>
              );
            }
            return null;
          }}
          cursor={{ stroke: '#f1f5f9', strokeWidth: 2 }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={type === 'LUCE' ? '#f59e0b' : '#3b82f6'}
          strokeWidth={3}
          fillOpacity={1}
          fill={`url(#${type}-gradient-${metric})`}
          animationDuration={1000}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

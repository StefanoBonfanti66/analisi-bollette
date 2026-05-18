import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { Bill } from '../../types';
import { cn, formatCurrency } from '../../lib/utils';

interface ComparisonBarChartProps {
  bills: Bill[];
}

export default function ComparisonBarChart({ bills }: ComparisonBarChartProps) {
  const data = bills
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-10)
    .map(b => ({
      name: b.periodLabel,
      shortName: b.periodLabel.split(' ')[0],
      type: b.type,
      consumption: b.consumption,
      unitCost: b.unitCost,
      total: b.totalAmount
    }));

  if (data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-300 italic text-xs">
        Carica bollette per confrontare i dati.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
          tickFormatter={(val) => val.split(' ')[0]}
        />
        <YAxis
          yAxisId="left"
          orientation="left"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: '#94a3b8' }}
          label={{ value: '€/unità', angle: -90, position: 'insideLeft', offset: -10, style: { fontSize: 8, fontWeight: 700, fill: '#94a3b8' } }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: '#94a3b8' }}
          label={{ value: 'Consumo', angle: 90, position: 'insideRight', offset: -10, style: { fontSize: 8, fontWeight: 700, fill: '#94a3b8' } }}
        />
        <Tooltip
          cursor={{ fill: '#f8fafc' }}
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const d = payload[0].payload;
              return (
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xl min-w-[200px]">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-50 pb-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                      {d.name}
                    </p>
                    <span className={cn(
                      "text-[9px] px-2 py-0.5 rounded font-black",
                      d.type === 'LUCE' ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"
                    )}>
                      {d.type}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        <span className="text-xs text-slate-500">Costo Unitario</span>
                      </div>
                      <span className="text-xs font-bold text-slate-800">{d.unitCost.toFixed(4)} €</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                        <span className="text-xs text-slate-500">Consumo</span>
                      </div>
                      <span className="text-xs font-bold text-slate-800">{d.consumption} {d.type === 'LUCE' ? 'kWh' : 'Smc'}</span>
                    </div>
                    <div className="pt-2 mt-2 border-t border-slate-100 flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400">Spesa Totale</span>
                      <span className="text-sm font-black text-blue-600">{formatCurrency(d.total)}</span>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        <Bar yAxisId="left" dataKey="unitCost" radius={[4, 4, 0, 0]} barSize={12}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-cost-${index}`}
              fill={entry.type === 'LUCE' ? '#f59e0b' : '#3b82f6'}
              fillOpacity={0.8}
            />
          ))}
        </Bar>
        <Bar yAxisId="right" dataKey="consumption" radius={[4, 4, 0, 0]} barSize={12} fill="#e2e8f0" />
      </BarChart>
    </ResponsiveContainer>
  );
}

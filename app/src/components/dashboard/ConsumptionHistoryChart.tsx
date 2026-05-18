import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Bill } from '../../types';

interface ConsumptionHistoryChartProps {
  bills: Bill[];
}

export default function ConsumptionHistoryChart({ bills }: ConsumptionHistoryChartProps) {
  const processedData = React.useMemo(() => {
    const months: Record<string, any> = {};

    const sortedBills = [...bills].sort((a, b) => a.date.localeCompare(b.date));

    const relevantBills = sortedBills.slice(-24);

    relevantBills.forEach(bill => {
      const monthKey = bill.date.substring(0, 7);
      if (!months[monthKey]) {
        months[monthKey] = {
          date: bill.date,
          label: bill.periodLabel.split(' ')[0] + ' ' + bill.periodLabel.split(' ')[1].substring(2),
          luceCons: 0,
          luceUnit: 0,
          gasCons: 0,
          gasUnit: 0,
          hasLuce: false,
          hasGas: false,
        };
      }

      if (bill.type === 'LUCE') {
        months[monthKey].luceCons = bill.consumption;
        months[monthKey].luceUnit = bill.unitCost;
        months[monthKey].hasLuce = true;
      } else {
        months[monthKey].gasCons = bill.consumption;
        months[monthKey].gasUnit = bill.unitCost;
        months[monthKey].hasGas = true;
      }
    });

    return Object.values(months).sort((a: any, b: any) => a.date.localeCompare(b.date));
  }, [bills]);

  if (processedData.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-300 italic text-xs">
        Dati insufficienti per lo storico.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={processedData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 9, fill: '#64748b', fontWeight: 600 }}
          dy={10}
        />
        <YAxis
          yAxisId="cons"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 9, fill: '#94a3b8' }}
          label={{ value: 'Consumo (kWh/Smc)', angle: -90, position: 'insideLeft', offset: 0, style: { fontSize: 8, fontWeight: 700, fill: '#94a3b8' } }}
        />
        <YAxis
          yAxisId="unit"
          orientation="right"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 9, fill: '#94a3b8' }}
          label={{ value: 'Costo (€/u)', angle: 90, position: 'insideRight', offset: 0, style: { fontSize: 8, fontWeight: 700, fill: '#94a3b8' } }}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload;
              return (
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xl min-w-[200px]">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-50 pb-2">
                    {data.label}
                  </p>
                  <div className="space-y-3">
                    {data.hasLuce && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-amber-400 rounded-full" />
                          <span className="text-[10px] font-bold text-amber-600 uppercase">Energia Elettrica</span>
                        </div>
                        <div className="flex justify-between items-center pl-4">
                          <span className="text-xs text-slate-500">Consumo</span>
                          <span className="text-xs font-bold text-slate-800">{data.luceCons} kWh</span>
                        </div>
                        <div className="flex justify-between items-center pl-4">
                          <span className="text-xs text-slate-500">Costo Unit.</span>
                          <span className="text-xs font-bold text-slate-800">{data.luceUnit.toFixed(4)} €</span>
                        </div>
                      </div>
                    )}
                    {data.hasGas && (
                      <div className="space-y-1 pt-2 border-t border-slate-50">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          <span className="text-[10px] font-bold text-blue-600 uppercase">Gas Naturale</span>
                        </div>
                        <div className="flex justify-between items-center pl-4">
                          <span className="text-xs text-slate-500">Consumo</span>
                          <span className="text-xs font-bold text-slate-800">{data.gasCons} Smc</span>
                        </div>
                        <div className="flex justify-between items-center pl-4">
                          <span className="text-xs text-slate-500">Costo Unit.</span>
                          <span className="text-xs font-bold text-slate-800">{data.gasUnit.toFixed(4)} €</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        <Legend
          verticalAlign="top"
          align="right"
          iconType="circle"
          wrapperStyle={{ fontSize: '10px', fontWeight: 700, paddingBottom: '20px' }}
        />
        <Line
          yAxisId="cons"
          type="monotone"
          dataKey="luceCons"
          name="Consumo Luce (kWh)"
          stroke="#f59e0b"
          strokeWidth={3}
          dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }}
          activeDot={{ r: 6, strokeWidth: 0 }}
          connectNulls
        />
        <Line
          yAxisId="cons"
          type="monotone"
          dataKey="gasCons"
          name="Consumo Gas (Smc)"
          stroke="#3b82f6"
          strokeWidth={3}
          dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
          activeDot={{ r: 6, strokeWidth: 0 }}
          connectNulls
        />
        <Line
          yAxisId="unit"
          type="monotone"
          dataKey="luceUnit"
          name="Costo Unit. Luce"
          stroke="#f59e0b"
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
          connectNulls
        />
        <Line
          yAxisId="unit"
          type="monotone"
          dataKey="gasUnit"
          name="Costo Unit. Gas"
          stroke="#3b82f6"
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

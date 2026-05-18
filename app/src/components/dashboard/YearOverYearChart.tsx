import { useMemo } from "react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import { Bill } from "../../types"
import { cn, formatCurrency } from "../../lib/utils"

interface YearOverYearChartProps {
  bills: Bill[]
  type: "LUCE" | "GAS"
}

export default function YearOverYearChart({ bills, type }: YearOverYearChartProps) {
  const data = useMemo(() => {
    const filtered = bills.filter(b => b.type === type).sort((a, b) => a.date.localeCompare(b.date))
    const byMonth: Record<string, { year: number; month: string; label: string; consumo: number; spesa: number }[]> = {}

    filtered.forEach(b => {
      const month = b.date.substring(5, 7)
      const year = b.date.substring(0, 4)
      if (!byMonth[month]) byMonth[month] = []
      byMonth[month].push({
        year: parseInt(year),
        month,
        label: new Date(b.date).toLocaleDateString("it-IT", { month: "short" }),
        consumo: b.consumption,
        spesa: b.totalAmount,
      })
    })

    const months = Object.keys(byMonth).sort()
    const years = [...new Set(filtered.map(b => b.date.substring(0, 4)))].sort()

    return months.map(month => {
      const entries = byMonth[month]
      const row: any = { month: entries[0].label }
      let prevConsumo: number | null = null
      let prevSpesa: number | null = null
          years.forEach(year => {
        const entry = entries.find(e => e.year === parseInt(year))
        if (entry) {
          row[`${year}_consumo`] = entry.consumo
          row[`${year}_spesa`] = entry.spesa
          if (prevConsumo !== null) {
            row[`${year}_varConsumo`] = ((entry.consumo - prevConsumo) / prevConsumo * 100).toFixed(1)
          }
          if (prevSpesa !== null) {
            row[`${year}_varSpesa`] = ((entry.spesa - prevSpesa) / prevSpesa * 100).toFixed(1)
          }
          prevConsumo = entry.consumo
          prevSpesa = entry.spesa
        }
      })
      return row
    })
  }, [bills, type])

  const years = useMemo(() => {
    return [...new Set(bills.filter(b => b.type === type).map(b => b.date.substring(0, 4)))].sort()
  }, [bills, type])

  if (years.length < 2) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 italic text-sm">
        {years.length === 0
          ? "Nessun dato disponibile"
          : "Servono bollette di almeno 2 anni diversi per il confronto"}
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#64748b", fontWeight: 600 }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#94a3b8" }} />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xl min-w-[200px]">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{payload[0]?.payload?.month}</p>
                  <div className="space-y-2">
                    {years.map(year => {
                      const consumo = payload[0]?.payload?.[`${year}_consumo`]
                      const spesa = payload[0]?.payload?.[`${year}_spesa`]
                      const varCons = payload[0]?.payload?.[`${year}_varConsumo`]
                      if (!consumo) return null
                      return (
                        <div key={year} className="border-b border-slate-50 pb-2 last:border-0">
                          <p className="text-xs font-bold text-slate-700">{year}</p>
                          <p className="text-xs text-slate-500">{consumo} {type === "LUCE" ? "kWh" : "Smc"}</p>
                          <p className="text-xs text-slate-500">{formatCurrency(spesa)}</p>
                          {varCons && (
                            <p className={cn("text-[10px] font-bold", parseFloat(varCons) <= 0 ? "text-emerald-500" : "text-rose-500")}>
                              {parseFloat(varCons) > 0 ? "+" : ""}{varCons}%
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        <Legend
          verticalAlign="top"
          align="right"
          iconType="circle"
          wrapperStyle={{ fontSize: "10px", fontWeight: 700, paddingBottom: "20px" }}
        />
        {years.map((year, i) => (
          <Bar
            key={year}
            dataKey={`${year}_consumo`}
            name={year}
            fill={type === "LUCE" ? ["#f59e0b", "#d97706"][i % 2] : ["#3b82f6", "#2563eb"][i % 2]}
            radius={[4, 4, 0, 0]}
            barSize={20}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

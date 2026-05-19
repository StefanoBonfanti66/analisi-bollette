import { useMemo } from 'react';
import { Bill } from '../../types';
import { formatCurrency, cn } from '../../lib/utils';
import { ArrowRight, ShieldCheck, Sparkles, Zap, Droplets } from 'lucide-react';
import { motion } from 'motion/react';

interface MarketComparisonProps {
  bills: Bill[];
}

const MARKET_BENCHMARKS = {
  LUCE: {
    excellent: 0.08,
    good: 0.12,
    average: 0.16,
    expensive: 0.22,
  },
  GAS: {
    excellent: 0.35,
    good: 0.50,
    average: 0.85,
    expensive: 1.10,
  },
};

export default function MarketComparison({ bills }: MarketComparisonProps) {
  const latestLuce = useMemo(() =>
    bills
      .filter(b => b.type === 'LUCE')
      .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))[0]
  , [bills]);

  const latestGas = useMemo(() =>
    bills
      .filter(b => b.type === 'GAS')
      .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))[0]
  , [bills]);

  const calculateSavings = (bill: Bill, targetRate: number) => {
    const annualConsumption = bill.consumption * 6;
    const currentAnnualCost = bill.unitCost * annualConsumption;
    const targetAnnualCost = targetRate * annualConsumption;
    return Math.max(0, currentAnnualCost - targetAnnualCost);
  };

  const getStatus = (cost: number, type: 'LUCE' | 'GAS') => {
    const bench = MARKET_BENCHMARKS[type];
    if (cost <= bench.excellent) return { label: 'Eccellente', color: 'text-emerald-500', bg: 'bg-emerald-50' };
    if (cost <= bench.good) return { label: 'Buona', color: 'text-teal-500', bg: 'bg-teal-50' };
    if (cost <= bench.average) return { label: 'Nella Media', color: 'text-blue-500', bg: 'bg-blue-50' };
    return { label: 'Costosa', color: 'text-rose-500', bg: 'bg-rose-50' };
  };

  if (bills.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Confronto Mercato
          </h3>
          <p className="text-xs text-slate-400 font-medium lowercase italic">Analisi delle tue tariffe attuali rispetto ai benchmark nazionali</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-100 transition-colors" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Energia Elettrica</p>
                  <p className="font-bold text-slate-800">{latestLuce?.provider || 'Nessun dato'}</p>
                </div>
              </div>
              {latestLuce && (
                <span className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                  getStatus(latestLuce.unitCost, 'LUCE').bg,
                  getStatus(latestLuce.unitCost, 'LUCE').color
                )}>
                  {getStatus(latestLuce.unitCost, 'LUCE').label}
                </span>
              )}
            </div>

            {latestLuce ? (
              <div className="space-y-8">
                <div className="flex items-end gap-3">
                  <p className="text-4xl font-black text-slate-800 tracking-tighter">
                    {latestLuce.unitCost.toFixed(4)} <span className="text-base text-slate-400 font-medium">€/kWh</span>
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Risparmio Potenziale Anno</p>
                    <p className="text-xl font-black text-emerald-600">{formatCurrency(calculateSavings(latestLuce, MARKET_BENCHMARKS.LUCE.good))}</p>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (latestLuce.unitCost / 0.3) * 100)}%` }}
                      className="h-full bg-amber-400"
                    />
                  </div>
                  <div className="flex justify-between text-[8px] font-black text-slate-300 mt-2 tracking-widest uppercase">
                    <span>Ottimo (0.08)</span>
                    <span>Costoso (0.22)</span>
                  </div>
                </div>

                <button
                  onClick={() => window.open('https://www.ilportaleofferte.it/', '_blank', 'noopener,noreferrer')}
                  className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 group"
                >
                  Vedi Offerte Migliori
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-300 italic text-sm">Carica una bolletta luce per l'analisi</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-100 transition-colors" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Gas Naturale</p>
                  <p className="font-bold text-slate-800">{latestGas?.provider || 'Nessun dato'}</p>
                </div>
              </div>
              {latestGas && (
                <span className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                  getStatus(latestGas.unitCost, 'GAS').bg,
                  getStatus(latestGas.unitCost, 'GAS').color
                )}>
                  {getStatus(latestGas.unitCost, 'GAS').label}
                </span>
              )}
            </div>

            {latestGas ? (
              <div className="space-y-8">
                <div className="flex items-end gap-3">
                  <p className="text-4xl font-black text-slate-800 tracking-tighter">
                    {latestGas.unitCost.toFixed(3)} <span className="text-base text-slate-400 font-medium">€/Smc</span>
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Risparmio Potenziale Anno</p>
                    <p className="text-xl font-black text-emerald-600">{formatCurrency(calculateSavings(latestGas, MARKET_BENCHMARKS.GAS.good))}</p>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (latestGas.unitCost / 1.5) * 100)}%` }}
                      className="h-full bg-blue-500"
                    />
                  </div>
                  <div className="flex justify-between text-[8px] font-black text-slate-300 mt-2 tracking-widest uppercase">
                    <span>Ottimo (0.35)</span>
                    <span>Costoso (1.10)</span>
                  </div>
                </div>

                <button
                  onClick={() => window.open('https://www.ilportaleofferte.it/', '_blank', 'noopener,noreferrer')}
                  className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 group"
                >
                  Vedi Offerte Migliori
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-300 italic text-sm">Carica una bolletta gas per l'analisi</div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-blue-600 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center gap-8 shadow-blue-200 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-50" />
        <div className="relative z-10 flex-1">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-6 h-6 text-blue-200" />
            <h3 className="text-2xl font-black tracking-tight">Analisi Certificata</h3>
          </div>
          <p className="text-blue-100 mb-6 leading-relaxed text-sm font-medium">
            I grafici sopra confrontano la tua spesa reale con le migliori tariffe PLACET e offerte del mercato libero censite da ARERA. I calcoli sono puramente indicativi basati sul costo unitario estratto dai tuoi PDF.
          </p>
          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Mercato Libero</div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Tutela Graduale</div>
          </div>
        </div>
        <div className="relative z-10 p-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
          <div className="bg-white p-6 rounded-xl text-slate-900">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-center">Indice Prezzo Medio (PUN)</p>
            <p className="text-2xl font-black text-center">0.114 <span className="text-xs font-bold text-slate-400">€/kWh</span></p>
            <div className="mt-4 pt-4 border-t border-slate-50 text-[9px] text-center text-slate-400 leading-tight">
              Ultimo aggiornamento Maggio 2024.<br/>Dati indicativi per confronto rapido.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Bill } from '../../types';
import StatCard from './StatCard';
import ConsumptionChart from './ConsumptionChart';
import ComparisonBarChart from './ComparisonBarChart';
import ConsumptionHistoryChart from './ConsumptionHistoryChart';
import YearOverYearChart from './YearOverYearChart';
import MarketComparison from './MarketComparison';
import { TrendingUp, Droplets, Zap, AlertCircle, ChevronDown, Upload, BarChart3 } from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardProps {
  bills: Bill[];
}

interface BillTableRowProps {
  bill: Bill;
}

const BillTableRow: React.FC<BillTableRowProps> = ({ bill }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <>
      <tr
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "hover:bg-blue-50/30 transition-colors cursor-pointer group",
          isExpanded && "bg-blue-50/50"
        )}
      >
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            <ChevronDown className={cn(
              "w-3.5 h-3.5 text-slate-300 transition-transform duration-300",
              isExpanded && "rotate-180 text-blue-500"
            )} />
            <span className="font-bold text-slate-700">{bill.periodLabel}</span>
          </div>
        </td>
        <td className="px-6 py-4 text-center">
          <span className={cn(
            "inline-block w-2 h-2 rounded-full",
            bill.type === 'LUCE' ? "bg-amber-400" : "bg-blue-500"
          )} />
        </td>
        <td className="px-6 py-4 font-mono text-xs text-slate-400">
          {bill.consumption} {bill.type === 'LUCE' ? 'kWh' : 'Smc'}
        </td>
        <td className="px-6 py-4 text-right font-black text-slate-800">{formatCurrency(bill.totalAmount)}</td>
        <td className="px-6 py-4 text-center">
          <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] font-bold">ANALIZZATA</span>
        </td>
      </tr>
      <AnimatePresence>
        {isExpanded && (
          <tr className="bg-slate-50/30 border-none">
            <td colSpan={5} className="px-6 py-0">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="py-6 flex flex-wrap gap-12 border-t border-blue-100/50">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Composizione Costi</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-8 justify-between w-48">
                        <span className="text-xs text-slate-500">Costi Fissi</span>
                        <span className="text-xs font-bold text-slate-700">{formatCurrency(bill.fixedCosts)}</span>
                      </div>
                      <div className="flex items-center gap-8 justify-between w-48">
                        <span className="text-xs text-slate-500">Costi Variabili</span>
                        <span className="text-xs font-bold text-slate-700">{formatCurrency(bill.variableCosts)}</span>
                      </div>
                      {bill.tvLicenseFee && bill.tvLicenseFee > 0 && (
                        <div className="flex items-center gap-8 justify-between w-48 px-2 py-1 bg-amber-50 rounded-lg border border-amber-100">
                          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-tighter">Canone TV</span>
                          <span className="text-xs font-black text-amber-900">{formatCurrency(bill.tvLicenseFee)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-8 justify-between w-48 pt-2 border-t border-slate-100 italic">
                        <span className="text-[10px] text-slate-400">Imposte & Altro</span>
                        <span className="text-[10px] font-bold text-slate-400">
                          {formatCurrency(Math.max(0, bill.totalAmount - bill.fixedCosts - bill.variableCosts - (bill.tvLicenseFee || 0)))}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Dettagli Fornitura</p>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] text-slate-400">Intestatario</p>
                        <p className="text-xs font-bold text-slate-700">{bill.customerName || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400">Fornitore</p>
                        <p className="text-xs font-bold text-slate-700">{bill.provider}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400">Costo Unitario Medio</p>
                        <p className="text-xs font-black text-blue-600">
                          {bill.unitCost.toFixed(4)} €/{bill.type === 'LUCE' ? 'kWh' : 'Smc'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 min-w-[200px]">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Suggerimento Rapido</p>
                    <div className="bg-white/50 border border-slate-100 rounded-xl p-3">
                      <p className="text-xs text-slate-600 leading-relaxed italic">
                        "I costi fissi rappresentano il {( (bill.fixedCosts / bill.totalAmount) * 100 ).toFixed(0)}% del totale.
                        {bill.fixedCosts / bill.totalAmount > 0.4 ? ' Considera una tariffa con quote fisse inferiori.' : ' La ripartizione sembra ottimale.'}"
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
}

export default function Dashboard({ bills }: DashboardProps) {
  const [luceMetric, setLuceMetric] = React.useState<'consumption' | 'totalAmount' | 'unitCost'>('consumption');
  const [gasMetric, setGasMetric] = React.useState<'consumption' | 'totalAmount' | 'unitCost'>('consumption');

  const [tableFilter, setTableFilter] = React.useState<'ALL' | 'LUCE' | 'GAS'>('ALL');
  const [providerFilter, setProviderFilter] = React.useState<string>('ALL');
  const [dateRange, setDateRange] = React.useState<{ start: string; end: string }>({ start: '', end: '' });

  const providers = React.useMemo(() => {
    const p = new Set(bills.map(b => b.provider));
    return Array.from(p).sort();
  }, [bills]);

  const latestLuce = bills.filter(b => b.type === 'LUCE').sort((a, b) => b.date.localeCompare(a.date))[0];
  const latestGas = bills.filter(b => b.type === 'GAS').sort((a, b) => b.date.localeCompare(a.date))[0];

  const totalSpent = bills.reduce((acc, b) => acc + b.totalAmount, 0);
  const averageLuce = bills.filter(b => b.type === 'LUCE').length
    ? bills.filter(b => b.type === 'LUCE').reduce((acc, b) => acc + b.totalAmount, 0) / bills.filter(b => b.type === 'LUCE').length
    : 0;

  const filteredBills = bills
    .filter(b => tableFilter === 'ALL' || b.type === tableFilter)
    .filter(b => providerFilter === 'ALL' || b.provider === providerFilter)
    .filter(b => {
      if (!dateRange.start && !dateRange.end) return true;
      const billDate = b.date;
      if (dateRange.start && billDate < dateRange.start) return false;
      if (dateRange.end && billDate > dateRange.end) return false;
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case 'consumption': return 'Consumo';
      case 'totalAmount': return 'Spesa Totale';
      case 'unitCost': return 'Costo Unitario';
      default: return '';
    }
  };

  const getMetricUnit = (metric: string, type: string) => {
    switch (metric) {
      case 'consumption': return type === 'LUCE' ? 'kWh' : 'Smc';
      case 'totalAmount': return '€';
      case 'unitCost': return `€/${type === 'LUCE' ? 'kWh' : 'Smc'}`;
      default: return '';
    }
  };

  const latestBill = [...bills].sort((a, b) => b.date.localeCompare(a.date))[0];
  const customerName = latestBill?.customerName;

  return (
    <div className="space-y-6">
      {customerName && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              Ciao, {customerName}
            </h2>
            <p className="text-xs text-slate-400 font-medium">Ecco il riepilogo delle tue utenze analizzate</p>
          </div>
          <div className="flex -space-x-2">
            {[...new Set(bills.map(b => b.provider))].map((provider, i) => (
              <div
                key={provider}
                className={cn(
                  "w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-black uppercase text-white shadow-sm ring-1 ring-slate-100",
                  i % 2 === 0 ? "bg-blue-600" : "bg-amber-500"
                )}
                title={provider}
              >
                {provider.substring(0, 2)}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Spesa Totale"
          value={formatCurrency(totalSpent)}
          icon={TrendingUp}
          trend="+5.2% rispetto all'anno scorso"
          trendType="down"
        />
        <StatCard
          title="Ultima Luce"
          value={latestLuce ? formatCurrency(latestLuce.totalAmount) : 'N/A'}
          icon={Zap}
          trend={latestLuce ? latestLuce.periodLabel : 'Nessun dato'}
        />
        <StatCard
          title="Ultimo Gas"
          value={latestGas ? formatCurrency(latestGas.totalAmount) : 'N/A'}
          icon={Droplets}
          trend={latestGas ? latestGas.periodLabel : 'Nessun dato'}
        />
        <StatCard
          title="Media Mensile"
          value={formatCurrency(averageLuce)}
          icon={AlertCircle}
          trend="Calcolata su tutte le bollette"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[450px]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-bold text-slate-800">Andamento Luce</h3>
              <p className="text-xs text-slate-400 font-medium">{getMetricLabel(luceMetric)} in {getMetricUnit(luceMetric, 'LUCE')}</p>
            </div>
            <div className="flex bg-slate-50 p-1 rounded-xl">
              <button
                onClick={() => setLuceMetric('consumption')}
                className={cn(
                  "px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all",
                  luceMetric === 'consumption' ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                CONS.
              </button>
              <button
                onClick={() => setLuceMetric('totalAmount')}
                className={cn(
                  "px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all",
                  luceMetric === 'totalAmount' ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                COSTO
              </button>
              <button
                onClick={() => setLuceMetric('unitCost')}
                className={cn(
                  "px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all",
                  luceMetric === 'unitCost' ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                UNIT.
              </button>
            </div>
          </div>
          <div className="h-[300px]">
            <ConsumptionChart bills={bills} type="LUCE" metric={luceMetric} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[450px]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-bold text-slate-800">Andamento Gas</h3>
              <p className="text-xs text-slate-400 font-medium">{getMetricLabel(gasMetric)} in {getMetricUnit(gasMetric, 'GAS')}</p>
            </div>
            <div className="flex bg-slate-50 p-1 rounded-xl">
              <button
                onClick={() => setGasMetric('consumption')}
                className={cn(
                  "px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all",
                  gasMetric === 'consumption' ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                CONS.
              </button>
              <button
                onClick={() => setGasMetric('totalAmount')}
                className={cn(
                  "px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all",
                  gasMetric === 'totalAmount' ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                COSTO
              </button>
              <button
                onClick={() => setGasMetric('unitCost')}
                className={cn(
                  "px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all",
                  gasMetric === 'unitCost' ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                UNIT.
              </button>
            </div>
          </div>
          <div className="h-[300px]">
            <ConsumptionChart bills={bills} type="GAS" metric={gasMetric} />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[450px]">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="font-bold text-slate-800">Confronto Costi Unitari</h3>
            <p className="text-xs text-slate-400 font-medium italic">Analisi comparativa del costo per unità (€/kWh e €/Smc)</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-400 rounded-full" />
              <span className="text-[10px] font-bold text-slate-400">LUCE</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span className="text-[10px] font-bold text-slate-400">GAS</span>
            </div>
          </div>
        </div>
        <div className="h-[300px]">
          <ComparisonBarChart bills={bills} />
        </div>
      </div>

      <MarketComparison bills={bills} />

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[450px]">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="font-bold text-slate-800">Storico Consumi</h3>
            <p className="text-xs text-slate-400 font-medium italic">Analisi dell'andamento dei consumi e costi unitari</p>
          </div>
        </div>
        <div className="h-[300px]">
          <ConsumptionHistoryChart bills={bills} />
        </div>
      </div>

      {[...new Set(bills.map(b => b.date.substring(0, 4)))].length >= 2 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[450px]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-800">Confronto Annuale</h3>
            </div>
            <p className="text-xs text-slate-400 font-medium italic">Consumi mese per mese tra anni diversi</p>
          </div>
          <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg">
              <div className="w-2 h-2 bg-amber-400 rounded-full" />
              <span className="text-[10px] font-bold text-slate-500">LUCE</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span className="text-[10px] font-bold text-slate-500">GAS</span>
            </div>
          </div>
          <div className="flex-1 h-[300px]">
            <YearOverYearChart bills={bills} type="LUCE" />
          </div>
        </div>
      )}

      {bills.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-16 text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Upload className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-xl font-black text-slate-800 mb-2">Nessun Dato Ancora</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-8">
            Carica la tua prima bolletta in formato PDF nella sezione "Report Annuali" per vedere il riepilogo delle tue utenze e le analisi dei consumi.
          </p>
          <a
            href="/"
            onClick={(e) => { e.preventDefault(); alert('Vai su "Report Annuali" per caricare un PDF.'); }}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            <Upload className="w-4 h-4" />
            Vai a Report Annuali
          </a>
        </div>
      )}

      {bills.length > 0 && (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="font-bold text-slate-800 text-sm italic tracking-tight">Analisi Costi Recenti</h3>
            <button className="text-blue-600 text-[10px] font-bold uppercase tracking-widest text-left sm:text-right">Esporta Dettagli</button>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex bg-slate-50 p-1 rounded-xl">
              <button
                onClick={() => setTableFilter('ALL')}
                className={cn(
                  "px-3 py-1 text-[10px] font-bold rounded-lg transition-all",
                  tableFilter === 'ALL' ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                TUTTE
              </button>
              <button
                onClick={() => setTableFilter('LUCE')}
                className={cn(
                  "px-3 py-1 text-[10px] font-bold rounded-lg transition-all",
                  tableFilter === 'LUCE' ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                LUCE
              </button>
              <button
                onClick={() => setTableFilter('GAS')}
                className={cn(
                  "px-3 py-1 text-[10px] font-bold rounded-lg transition-all",
                  tableFilter === 'GAS' ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                GAS
              </button>
            </div>

            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              className="bg-slate-50 border-none text-[10px] font-bold text-slate-600 rounded-xl px-3 py-1.5 focus:ring-1 focus:ring-blue-100 outline-none"
            >
              <option value="ALL">TUTTI I FORNITORI</option>
              {providers.map(p => (
                <option key={p} value={p}>{p.toUpperCase()}</option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-1">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Da</span>
                <input
                  type="month"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="bg-transparent border-none text-[10px] font-bold text-slate-600 outline-none cursor-pointer"
                />
              </div>
              <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-1">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">A</span>
                <input
                  type="month"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="bg-transparent border-none text-[10px] font-bold text-slate-600 outline-none cursor-pointer"
                />
              </div>
              {(dateRange.start || dateRange.end || providerFilter !== 'ALL') && (
                <button
                  onClick={() => {
                    setDateRange({ start: '', end: '' });
                    setProviderFilter('ALL');
                    setTableFilter('ALL');
                  }}
                  className="text-rose-500 text-[10px] font-bold uppercase tracking-widest hover:underline"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                <th className="px-6 py-4">PERIODO</th>
                <th className="px-6 py-4 text-center">TIPO</th>
                <th className="px-6 py-4">CONSUMO</th>
                <th className="px-6 py-4 text-right">TOTALE</th>
                <th className="px-6 py-4 text-center">STATO</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-50">
              {filteredBills.slice(0, 8).map((bill) => (
                <BillTableRow key={bill.id} bill={bill} />
              ))}
              {filteredBills.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-400 italic font-medium">
                    {tableFilter === 'ALL'
                      ? "Inizia caricando la tua prima bolletta per vedere l'analisi."
                      : `Nessuna bolletta di tipo ${tableFilter} trovata.`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </div>
  );
}

import { Bill } from '../types';
import {
  Wind,
  Zap,
  Thermometer,
  CheckCircle2,
  Sparkles,
  Upload,
} from 'lucide-react';
import { motion } from 'motion/react';

interface TipsProps {
  bills: Bill[];
}

export default function Tips({ bills }: TipsProps) {
  const latestLuce = bills.filter(b => b.type === 'LUCE').sort((a, b) => b.date.localeCompare(a.date))[0];
  const latestGas = bills.filter(b => b.type === 'GAS').sort((a, b) => b.date.localeCompare(a.date))[0];

  const categories = [
    {
      id: 'lighting',
      label: 'Illuminazione',
      icon: Zap,
      tips: [
        'Sostituisci le vecchie lampadine con LED per risparmiare fino all\'80%.',
        'Sfrutta il più possibile la luce naturale e pulisci regolarmente finestre e vetri.',
        'Spegni sempre le luci quando esci da una stanza.',
      ],
    },
    {
      id: 'heating',
      label: 'Riscaldamento',
      icon: Thermometer,
      tips: [
        'Abbassa di 1°C la temperatura in casa: risparmierai circa il 7% sui consumi.',
        'Non coprire i termosifoni con mobili o tende lunghe.',
        'Effettua regolarmente la manutenzione della caldaia per massimizzare l\'efficienza.',
      ],
    },
    {
      id: 'appliances',
      label: 'Elettrodomestici',
      icon: Wind,
      tips: [
        'Usa lavatrice e lavastoviglie solo a pieno carico e con programmi "Eco".',
        'Evita lo stand-by: scollega i dispositivi che non usi tramite ciabatte con interruttore.',
        'Sbrina regolarmente il congelatore per ridurne il carico di lavoro.',
      ],
    },
  ];

  if (bills.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
          <Upload className="w-10 h-10 text-blue-600" />
        </div>
        <h3 className="text-xl font-black text-slate-800 mb-2">Nessun Suggerimento Ancora</h3>
        <p className="text-sm text-slate-400 max-w-md text-center mb-8">
          Carica una bolletta per ricevere consigli personalizzati basati sui tuoi consumi reali.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl mt-8">
          {['Illuminazione', 'Riscaldamento', 'Elettrodomestici'].map((cat, idx) => (
            <motion.div
              key={cat}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm opacity-50"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-blue-50 text-blue-600">
                {idx === 0 ? <Zap className="w-5 h-5" /> : idx === 1 ? <Thermometer className="w-5 h-5" /> : <Wind className="w-5 h-5" />}
              </div>
              <h3 className="text-base font-extrabold text-slate-800 mb-5">{cat}</h3>
              <ul className="space-y-4">
                {[1, 2, 3].map(i => (
                  <li key={i} className="flex gap-3 text-xs text-slate-300 leading-relaxed font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-200 mt-0.5 shrink-0" />
                    <span className="bg-slate-100 h-3 w-full rounded inline-block" />
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
        <p className="text-xs text-slate-300 mt-8 font-medium italic">Carica un PDF per sbloccare suggerimenti personalizzati</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-100 transition-colors" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Analisi Intelligente Consumi</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 w-fit px-2 py-0.5 rounded">Energia Elettrica</h4>
              {latestLuce && latestLuce.tips && latestLuce.tips.length > 0 ? (
                <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 space-y-3">
                  {latestLuce.tips.slice(0, 3).map((tip, i) => (
                    <p key={i} className="text-sm italic leading-relaxed text-slate-600 font-medium flex gap-2">
                      <span className="text-blue-500 shrink-0 mt-0.5">•</span>
                      <span>{tip}</span>
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 font-medium">
                  {latestLuce ? 'Nessun suggerimento personalizzato disponibile per questa bolletta.' : 'Carica una bolletta luce per sbloccare l\'analisi IA personalizzata.'}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 w-fit px-2 py-0.5 rounded">Gas Naturale</h4>
              {latestGas && latestGas.tips && latestGas.tips.length > 0 ? (
                <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 space-y-3">
                  {latestGas.tips.slice(0, 3).map((tip, i) => (
                    <p key={i} className="text-sm italic leading-relaxed text-slate-600 font-medium flex gap-2">
                      <span className="text-blue-500 shrink-0 mt-0.5">•</span>
                      <span>{tip}</span>
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 font-medium">
                  {latestGas ? 'Nessun suggerimento personalizzato disponibile per questa bolletta.' : 'Carica una bolletta gas per sbloccare l\'analisi IA personalizzata.'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Consigli per il Risparmio</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((cat, idx) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-blue-200 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 bg-blue-50 text-blue-600">
              <cat.icon className="w-5 h-5" />
            </div>

            <h3 className="text-base font-extrabold text-slate-800 mb-5">{cat.label}</h3>

            <ul className="space-y-4">
              {cat.tips.map((tip, i) => (
                <li key={i} className="flex gap-3 text-xs text-slate-500 leading-relaxed font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>

          </motion.div>
        ))}
      </div>    </div>
  );
}

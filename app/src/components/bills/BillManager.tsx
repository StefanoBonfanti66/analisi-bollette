import React, { useState } from 'react';
import { Bill } from '../../types';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  FileText,
  Trash2,
  Share2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Search,
  X,
} from 'lucide-react';
import { analyzeBillPdf } from '../../lib/gemini';
import { formatCurrency, formatConsumption, cn } from '../../lib/utils';
import { useToast } from '../../lib/toast';
import { motion, AnimatePresence } from 'motion/react';

interface BillManagerProps {
  bills: Bill[];
  addBill: (bill: Bill) => Promise<boolean>;
  deleteBill: (id: string) => Promise<boolean>;
  setBills: React.Dispatch<React.SetStateAction<Bill[]>>;
}

export default function BillManager({ bills, addBill, deleteBill, setBills }: BillManagerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [retryCountdown, setRetryCountdown] = useState<number | null>(null);
  const { toast } = useToast();

  const onDrop = async (acceptedFiles: File[]) => {
    setIsAnalyzing(true);
    setError(null);
    setUploadProgress({ current: 0, total: acceptedFiles.length });

    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i];
      setUploadProgress({ current: i + 1, total: acceptedFiles.length });

      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      try {
        const reader = new FileReader();
        const filePromise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.onerror = () => reject(new Error("Errore lettura file"));
          reader.readAsDataURL(file);
        });

        const base64 = await filePromise;
        const result = await analyzeBillPdf(base64);

        const isDuplicate = bills.some(b =>
          b.provider === result.provider &&
          b.type === result.type &&
          b.date === result.periodStart &&
          Math.abs(b.totalAmount - result.totalAmount) < 0.01
        );

        if (isDuplicate) {
          toast(`"${file.name}" già presente, saltata`, 'warning');
          continue;
        }

        const newBill: Bill = {
          id: Math.random().toString(36).substr(2, 9),
          type: result.type,
          customerName: result.customerName,
          date: result.periodStart,
          periodLabel: new Date(result.periodStart).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' }),
          totalAmount: result.totalAmount,
          consumption: result.consumption,
          unitCost: result.details.unitCost,
          fixedCosts: result.details.fixedCosts,
          variableCosts: result.details.variableCosts,
          tvLicenseFee: result.tvLicenseFee || 0,
          provider: result.provider,
          pdfName: file.name,
        };

        await addBill(newBill);
        toast(`"${file.name}" analizzata con successo`, 'success');
      } catch (e: any) {
        console.error("Error analyzing bill", e);
        const isRateLimit = e?.status === 429 || e?.message?.includes('429') || e?.message?.includes('RESOURCE_EXHAUSTED') || e?.code === 'QUOTA_EXHAUSTED';
        if (isRateLimit) {
          setError("Quota API esaurita. Attendi 1-2 minuti e riprova.");
          let countdown = 60;
          setRetryCountdown(countdown);
          const interval = setInterval(() => {
            countdown--;
            setRetryCountdown(countdown);
            if (countdown <= 0) {
              clearInterval(interval);
              setRetryCountdown(null);
              setError(null);
            }
          }, 1000);
          break;
        } else {
          setError(`Errore su "${file.name}": ${e.message || 'formato non supportato'}`);
        }
      }
    }
    setIsAnalyzing(false);
    setUploadProgress(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: true,
  });

  const shareBill = async (bill: Bill) => {
    const text = `Riepilogo Bolletta ${bill.type}:\nPeriodo: ${bill.periodLabel}\nConsumo: ${formatConsumption(bill.consumption, bill.type)}\nTotale: ${formatCurrency(bill.totalAmount)}\nFornitore: ${bill.provider}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Bolletta ${bill.type} - ${bill.periodLabel}`,
          text,
        });
        toast("Riepilogo condiviso!", 'success');
      } catch (err) {
        console.error("Error sharing", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        toast("Riepilogo copiato negli appunti!", 'success');
      } catch (err) {
        console.error("Could not copy text", err);
        toast("Errore nella copia", 'error');
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    const ok = await deleteBill(confirmDeleteId);
    if (ok) {
      toast("Bolletta eliminata", 'success');
    } else {
      toast("Errore durante l'eliminazione", 'error');
    }
    setConfirmDeleteId(null);
  };

  const filteredBills = bills.filter(b => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.provider.toLowerCase().includes(q) ||
      b.periodLabel.toLowerCase().includes(q) ||
      b.pdfName.toLowerCase().includes(q) ||
      b.type.toLowerCase().includes(q)
    );
  });

  const importRef = React.useRef<HTMLInputElement>(null);

  const exportToCSV = () => {
    if (bills.length === 0) return;

    const headers = ['Tipo', 'Periodo', 'Fornitore', 'Consumo (kWh/Smc)', 'Totale (€)', 'Costo Unitario (€)'];
    const rows = bills.map(b => [
      b.type,
      b.periodLabel,
      b.provider,
      b.consumption,
      b.totalAmount.toFixed(2),
      b.unitCost.toFixed(4),
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `report_energia_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = () => {
    if (bills.length === 0) return;
    const data = JSON.stringify(bills, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `bollette_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importFromJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (Array.isArray(data)) {
          setBills(prev => {
            const ids = new Set(prev.map(b => b.id));
            const nuovi = data.filter((b: any) => !ids.has(b.id));
            return [...prev, ...nuovi];
          });
        }
      } catch (err) {
          setError("File JSON non valido");
        }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-8">
      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-3xl p-16 transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden group",
          isDragActive ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50",
          isAnalyzing && "pointer-events-none opacity-60"
        )}
      >
        <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-500">
          {isAnalyzing ? <Loader2 className="w-10 h-10 text-blue-600 animate-spin" /> : <Upload className="w-10 h-10 text-blue-600" />}
        </div>

        <div className="text-center">
          <p className="text-2xl font-black text-slate-800 mb-2">
            {isAnalyzing
              ? (uploadProgress ? `Analisi file ${uploadProgress.current} di ${uploadProgress.total}` : "Analisi IA Attiva")
              : "Carica Bollette PDF"}
          </p>
          <p className="text-slate-400 max-w-sm text-sm font-medium">
            Trascina qui i tuoi documenti o clicca per selezionarli dal computer.
          </p>
        </div>

        <input {...getInputProps()} />

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 flex items-center gap-2 text-rose-600 bg-rose-50 px-4 py-2 rounded-full text-sm border border-rose-100"
            >
              <AlertCircle className="w-4 h-4" />
              {error}
              {retryCountdown !== null && retryCountdown > 0 && (
                <span className="font-black text-rose-700 ml-1 tabular-nums">{retryCountdown}s</span>
              )}
              <button onClick={() => { setError(null); setRetryCountdown(null); }} className="ml-2 opacity-60 hover:opacity-100">
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 flex items-center justify-between border-b border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Storico Documenti</h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => importRef.current?.click()}
              className="text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:text-blue-600 transition-colors"
            >
              Importa JSON
            </button>
            <span className="text-[10px] text-slate-200">|</span>
            <button
              onClick={exportToJSON}
              disabled={bills.length === 0}
              className="text-blue-600 text-[10px] font-bold uppercase tracking-widest hover:underline disabled:opacity-30"
            >
              Esporta JSON
            </button>
            <span className="text-[10px] text-slate-200">|</span>
            <button
              onClick={exportToCSV}
              disabled={bills.length === 0}
              className="text-blue-600 text-[10px] font-bold uppercase tracking-widest hover:underline disabled:opacity-30"
            >
              CSV
            </button>
          </div>
        </div>
        <input ref={importRef} type="file" accept=".json" onChange={importFromJSON} className="hidden" />

        <div className="px-5 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cerca per fornitore, periodo, nome file..."
              className="bg-transparent border-none text-sm text-slate-600 outline-none w-full placeholder:text-slate-300"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-slate-300 hover:text-slate-500 text-xs font-bold">X</button>
            )}
          </div>
        </div>

        <div className="divide-y divide-slate-50">
          <AnimatePresence initial={false}>
            {filteredBills.map((bill) => (
              <motion.div
                key={bill.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={cn(
                  "p-5 flex items-center justify-between group transition-colors",
                  bill.type === 'LUCE' ? "bg-amber-50/10" : "bg-blue-50/10"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    bill.type === 'LUCE' ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"
                  )}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-800">{bill.periodLabel}</span>
                      <span className={cn(
                        "text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter",
                        bill.type === 'LUCE' ? "bg-amber-500 text-white" : "bg-blue-600 text-white"
                      )}>{bill.type}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">#{bill.id.toUpperCase()} • {bill.provider}</p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-800">{formatCurrency(bill.totalAmount)}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      {bill.consumption} {bill.type === 'LUCE' ? 'kWh' : 'Smc'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => shareBill(bill)}
                      className="p-2 text-slate-200 hover:text-blue-600 rounded-lg transition-colors"
                      title="Condividi riepilogo"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(bill.id)}
                      className="p-2 text-slate-200 hover:text-rose-500 rounded-lg transition-colors"
                      title="Elimina bolletta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredBills.length === 0 && (
            <div className="py-24 text-center">
              {searchQuery ? (
                <div>
                  <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Nessun risultato</p>
                  <p className="text-[10px] text-slate-200 mt-1">Prova a cambiare la ricerca</p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Nessuna bolletta caricata</p>
                  <p className="text-[10px] text-slate-200 mt-1">Carica il tuo primo PDF per iniziare</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-900 text-white rounded-3xl p-8 flex items-center justify-between shrink-0 overflow-hidden relative group">
        <div className="absolute top-0 left-0 w-full h-full bg-blue-600/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-700 font-sans" />
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="font-bold text-lg">Report Annuali Automatici</p>
            <p className="text-sm text-slate-400">Tutti i tuoi dati sono salvati su cloud per la massima privacy.</p>
          </div>
        </div>
        <button className="relative z-10 bg-white text-slate-900 px-6 py-2.5 rounded-lg font-bold text-sm hover:scale-105 transition-all">
          Scopri di più
        </button>
      </div>

      <AnimatePresence>
        {confirmDeleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmDeleteId(null)}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm mx-4 text-center"
            >
              <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Trash2 className="w-7 h-7 text-rose-500" />
              </div>
              <h3 className="text-lg font-black text-slate-800 mb-2">Eliminare questa bolletta?</h3>
              <p className="text-sm text-slate-500 mb-8">Questa azione non può essere annullata.</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-6 py-3 rounded-xl bg-rose-500 text-white font-bold text-sm hover:bg-rose-600 transition-colors"
                >
                  Elimina
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

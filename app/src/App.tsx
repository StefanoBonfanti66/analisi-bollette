import { useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  Lightbulb,
  PlusCircle,
  Settings,
  Menu,
  Loader2,
} from 'lucide-react';
import { cn } from './lib/utils';
import { ToastProvider } from './lib/toast';
import Dashboard from './components/dashboard/Dashboard';
import BillManager from './components/bills/BillManager';
import Tips from './components/Tips';
import { useBills } from './hooks/useBills';
import { motion, AnimatePresence } from 'motion/react';

type View = 'dashboard' | 'bills' | 'tips' | 'settings';

export default function App() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { bills, loading, addBill, deleteBill, setBills } = useBills();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'bills', label: 'Report Annuali', icon: FileText },
    { id: 'tips', label: 'Suggerimenti', icon: Lightbulb },
  ];

  return (
    <ToastProvider>
      <div className="h-screen bg-slate-50 text-slate-900 flex flex-col font-sans overflow-hidden">
        <nav className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">E</div>
            <span className="text-xl font-semibold tracking-tight text-slate-800">EnergiaAnalytica</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex gap-6 text-sm font-medium text-slate-500">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id as View)}
                  className={cn(
                    "hover:text-slate-800 transition-colors",
                    activeView === item.id && "text-blue-600"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="hidden md:block h-8 w-px bg-slate-200 mx-2"></div>
            <button
              onClick={() => setActiveView('bills')}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Carica PDF
            </button>

            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </nav>

        <div className="flex-1 flex overflow-hidden">
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
              />
            )}
          </AnimatePresence>

          <aside className={cn(
            "fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-slate-200 p-6 flex flex-col gap-6 transform transition-transform duration-300 lg:relative lg:translate-x-0 lg:z-0 shadow-xl lg:shadow-none",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}>
            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Focus Analisi</h3>
              <div className="flex p-1 bg-slate-200/50 rounded-xl">
                <button className="flex-1 py-1.5 px-4 bg-white rounded-lg shadow-sm text-xs font-bold text-blue-600">Luce</button>
                <button className="flex-1 py-1.5 px-4 text-xs font-medium text-slate-500 hover:text-slate-700">Gas</button>
              </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Azioni Rapide</h3>
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveView(item.id as View);
                      setIsSidebarOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm",
                      activeView === item.id
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                    )}
                  >
                    <item.icon className={cn(
                      "w-4 h-4",
                      activeView === item.id ? "text-blue-600" : "text-slate-300 group-hover:text-slate-500"
                    )} />
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="mt-auto border-t border-slate-100 pt-4">
              <button className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-800 transition-colors w-full group text-sm">
                <Settings className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                <span>Impostazioni</span>
              </button>
            </div>
          </aside>

          <main className="flex-1 flex flex-col p-6 overflow-hidden max-w-full">
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    <p className="text-sm text-slate-400 font-medium">Caricamento dati...</p>
                  </div>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeView}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="max-w-7xl mx-auto"
                  >
                    {activeView === 'dashboard' && <Dashboard bills={bills} />}
                    {activeView === 'bills' && <BillManager bills={bills} addBill={addBill} deleteBill={deleteBill} setBills={setBills} />}
                    {activeView === 'tips' && <Tips bills={bills} />}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </main>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #e2e8f0;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #cbd5e1;
          }
        `}} />
      </div>
    </ToastProvider>
  );
}

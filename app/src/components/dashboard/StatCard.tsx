import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  icon?: LucideIcon;
  trend: string;
  trendType?: 'up' | 'down' | 'neutral';
}

export default function StatCard({ title, value, icon: Icon, trend, trendType = 'neutral' }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
          <p className="text-2xl font-extrabold text-slate-800 tracking-tight">{value}</p>
        </div>
        {Icon && (
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-1.5">
        {trendType !== 'neutral' && (
          <div className={cn(
            "w-1.5 h-1.5 rounded-full",
            trendType === 'up' ? "bg-rose-500" : "bg-teal-500"
          )} />
        )}
        <span className={cn(
          "text-[10px] font-semibold uppercase tracking-wider",
          trendType === 'up' && "text-rose-500",
          trendType === 'down' && "text-teal-600",
          trendType === 'neutral' && "text-slate-400"
        )}>
          {trend}
        </span>
      </div>
    </div>
  );
}

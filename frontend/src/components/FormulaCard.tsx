import React from 'react';
import { BookOpen } from 'lucide-react';

interface FormulaCardProps {
  title: string;
  formula: string;
  variables: Array<{ symbol: string; meaning: string }>;
  explanation: string;
  academicNote?: string;
}

export const FormulaCard: React.FC<FormulaCardProps> = ({
  title,
  formula,
  variables,
  explanation,
  academicNote,
}) => {
  return (
    <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md space-y-3">
      <div className="flex items-center space-x-2 text-cyan-400">
        <BookOpen className="w-4 h-4" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">{title}</h4>
      </div>

      <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-center font-mono text-sm sm:text-base font-semibold text-cyan-300 overflow-x-auto">
        {formula}
      </div>

      <div className="space-y-1 text-xs text-slate-300">
        <p className="text-[11px] font-semibold text-slate-400">Variable Definitions:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] font-mono">
          {variables.map((v, i) => (
            <div key={i} className="flex items-start space-x-1.5">
              <span className="text-cyan-400 font-bold shrink-0">{v.symbol}:</span>
              <span className="text-slate-300 font-sans">{v.meaning}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-slate-400 pt-1 border-t border-slate-800/80 leading-relaxed">
        {explanation}
      </p>

      {academicNote && (
        <div className="p-2 rounded bg-cyan-950/30 border border-cyan-800/40 text-[10px] text-cyan-300">
          <span className="font-semibold text-cyan-200">Viva Insight: </span>
          {academicNote}
        </div>
      )}
    </div>
  );
};

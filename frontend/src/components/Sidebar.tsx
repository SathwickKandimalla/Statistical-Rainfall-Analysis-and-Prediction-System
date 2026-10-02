import React from 'react';
import {
  LayoutDashboard,
  Table,
  BarChart2,
  PieChart,
  Dice5,
  Binary,
  Activity,
  Layers,
  FlaskConical,
  Percent,
  GitCommit,
  TrendingUp,
  BookOpen,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';

export type NavTab =
  | 'overview'
  | 'explorer'
  | 'descriptive'
  | 'probability'
  | 'random_variables'
  | 'discrete_dist'
  | 'continuous_dist'
  | 'sampling'
  | 'hypothesis_means'
  | 'hypothesis_proportions'
  | 'hypothesis'           // kept for backward compat (old combined page)
  | 'correlation'
  | 'regression'
  | 'methodology'
  | 'viva'
  | 'datasource';

interface NavItem {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  badge?: string;
  accentColor?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpen: boolean;
  onClose: () => void;
}

// Module accent colors (used for active state indicator dot)
const MODULE_COLORS: Record<string, string> = {
  descriptive:              '#60a5fa',  // blue
  probability:              '#a78bfa',  // violet
  random_variables:         '#22d3ee',  // cyan
  discrete_dist:            '#fb923c',  // orange
  continuous_dist:          '#c084fc',  // purple
  sampling:                 '#34d399',  // green
  hypothesis_means:         '#fbbf24',  // amber
  hypothesis_proportions:   '#fbbf24',  // amber
  correlation:              '#818cf8',  // indigo
  regression:               '#10b981',  // emerald
};

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onClose,
}) => {
  const navSections: NavSection[] = [
    {
      title: 'Platform Overview',
      items: [
        { id: 'overview',  label: 'Overview Dashboard',    icon: LayoutDashboard },
        { id: 'explorer',  label: 'Data Quality & Table',  icon: Table },
      ],
    },
    {
      title: 'Syllabus Modules',
      items: [
        { id: 'descriptive',            label: 'Module I: Descriptive Statistics',       icon: BarChart2,     badge: 'I',    accentColor: '#60a5fa' },
        { id: 'probability',            label: 'Module II: Probability & Bayes',         icon: PieChart,      badge: 'II',   accentColor: '#a78bfa' },
        { id: 'random_variables',       label: 'Module III: Random Variables',           icon: Dice5,         badge: 'III',  accentColor: '#22d3ee' },
        { id: 'discrete_dist',          label: 'Module IV: Discrete Distributions',      icon: Binary,        badge: 'IV',   accentColor: '#fb923c' },
        { id: 'continuous_dist',        label: 'Module V: Continuous Distributions',     icon: Activity,      badge: 'V',    accentColor: '#c084fc' },
        { id: 'sampling',               label: 'Module VI: Sampling & CLT',              icon: Layers,        badge: 'VI',   accentColor: '#34d399' },
        { id: 'hypothesis_means',       label: 'Module VII: Hypothesis — Means',         icon: FlaskConical,  badge: 'VII',  accentColor: '#fbbf24' },
        { id: 'hypothesis_proportions', label: 'Module VIII: Hypothesis — Proportions',  icon: Percent,       badge: 'VIII', accentColor: '#fbbf24' },
        { id: 'correlation',            label: 'Module IX: Correlation',                 icon: GitCommit,     badge: 'IX',   accentColor: '#818cf8' },
        { id: 'regression',             label: 'Module X: Regression & Prediction',      icon: TrendingUp,    badge: 'X',    accentColor: '#10b981' },
      ],
    },
    {
      title: 'Academic Resources',
      items: [
        { id: 'methodology', label: 'Mathematical Methodology', icon: BookOpen },
        { id: 'viva',        label: 'Viva-Voce Exam Guide',     icon: GraduationCap },
        { id: 'datasource',  label: 'Data Source & Verification', icon: ShieldCheck },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: '#090e1b', borderRight: '1px solid #1a2540' }}
      >
        <div className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
          {navSections.map((section, idx) => (
            <div key={idx}>
              {/* Section category label */}
              <div className="sidebar-category mb-2">{section.title}</div>

              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  const accent = item.accentColor || '#22d3ee';

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTab(item.id);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-all duration-150 text-left group"
                      style={{
                        background: isActive
                          ? `color-mix(in srgb, ${accent} 10%, transparent)`
                          : 'transparent',
                        border: isActive
                          ? `1px solid color-mix(in srgb, ${accent} 30%, transparent)`
                          : '1px solid transparent',
                      }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Accent dot for active module */}
                        <div
                          className="shrink-0 w-1.5 h-1.5 rounded-full transition-all"
                          style={{
                            background: isActive ? accent : '#1e2a3a',
                          }}
                        />

                        <span style={{ color: isActive ? accent : '#475569', display: 'flex' }}>
                          <Icon className="w-3.5 h-3.5 shrink-0 transition-colors" />
                        </span>

                        <span
                          className="text-[12px] font-medium truncate transition-colors"
                          style={{
                            color: isActive ? '#f1f5f9' : '#64748b',
                          }}
                        >
                          {item.label}
                        </span>
                      </div>

                      {item.badge && (
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold shrink-0 ml-1 transition-colors"
                          style={{
                            background: isActive
                              ? `color-mix(in srgb, ${accent} 20%, transparent)`
                              : '#131f33',
                            color: isActive ? accent : '#3b4f6b',
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t" style={{ borderColor: '#1a2540', background: '#070b16' }}>
          <div className="rounded-lg p-2.5 text-[11px]" style={{ background: '#0d1525', border: '1px solid #1a2540' }}>
            <p className="font-semibold text-slate-300 text-[11px]">Course Reference</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Probability & Statistics • B.Tech Y2 T1</p>
            <p className="text-[10px] font-mono mt-1.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
              <span className="text-emerald-400">Live Open-Meteo ERA5 Data</span>
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

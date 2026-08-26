import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { DonutSegment } from '../../services/analyticsDataPipeline';

/* =========================================================================
   1. HORIZONTAL BAR CHART
   ========================================================================= */
export interface BarItem {
  id?: string;
  label: string;
  value: number;
  max?: number;
  unit?: string;
  color?: string;
  badge?: string;
  summary?: string;
}

interface HorizontalBarChartProps {
  items: BarItem[];
  maxValue?: number;
  valueFormat?: (val: number) => string;
  showSummary?: boolean;
}

export const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({
  items,
  maxValue = 100,
  valueFormat = (v) => `${v}`,
  showSummary = true
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!items || items.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
        INSUFFICIENT DATA AVAILABLE FOR CHART
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item, idx) => {
        const barMax = item.max || maxValue;
        const pct = Math.min(100, Math.max(0, (item.value / barMax) * 100));
        const barColor = item.color || '#2563eb';

        return (
          <div
            key={item.id || idx}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
            className="group relative p-2.5 rounded-xl transition-colors hover:bg-slate-50/80"
          >
            <div className="flex items-center justify-between gap-2 mb-1.5 text-xs">
              <div className="flex items-center gap-2 truncate">
                <span className="font-bold text-slate-900 truncate">
                  {item.label}
                </span>
                {item.badge && (
                  <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="font-mono font-bold text-slate-900 shrink-0">
                {valueFormat(item.value)} {item.unit || ''}
              </span>
            </div>

            {/* Track & Animated Fill Bar */}
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.8,
                  delay: shouldReduceMotion ? 0 : idx * 0.08,
                  ease: [0.22, 1, 0.36, 1]
                }}
                className="h-full rounded-full"
                style={{ backgroundColor: barColor }}
              />
            </div>

            {showSummary && item.summary && (
              <p className="text-[11px] text-slate-500 mt-1 leading-snug truncate">
                {item.summary}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

/* =========================================================================
   2. SVG DONUT CHART
   ========================================================================= */
interface DonutChartProps {
  segments: DonutSegment[];
  centerTitle?: string;
  centerSubtitle?: string;
  size?: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  segments,
  centerTitle,
  centerSubtitle,
  size = 200
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [activeSegment, setActiveSegment] = useState<DonutSegment | null>(null);

  const radius = 70;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;

  if (!segments || segments.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
        INSUFFICIENT DATA
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
      {/* SVG Donut */}
      <div className="relative shrink-0 flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 200 200" className="transform -rotate-90">
          {/* Background Track Ring */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />

          {/* Rendered Arc Segments */}
          {segments.map((seg, idx) => {
            const strokeDashoffset = circumference - (seg.percentage / 100) * circumference;
            const rotation = (cumulativePercent / 100) * 360;
            cumulativePercent += seg.percentage;

            return (
              <motion.circle
                key={idx}
                cx="100"
                cy="100"
                r={radius}
                fill="transparent"
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${circumference} ${circumference}`}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.9,
                  delay: shouldReduceMotion ? 0 : idx * 0.15,
                  ease: [0.22, 1, 0.36, 1]
                }}
                transform={`rotate(${rotation} 100 100)`}
                onMouseEnter={() => setActiveSegment(seg)}
                onMouseLeave={() => setActiveSegment(null)}
                className="cursor-pointer transition-opacity hover:opacity-85"
              />
            );
          })}
        </svg>

        {/* Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
          <span className="text-sm font-black text-slate-950 truncate max-w-[120px]">
            {activeSegment ? activeSegment.formatted : centerTitle || '100%'}
          </span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate max-w-[120px]">
            {activeSegment ? activeSegment.name : centerSubtitle || 'Distribution'}
          </span>
        </div>
      </div>

      {/* Legend & Details */}
      <div className="flex-1 space-y-2.5 w-full">
        {segments.map((seg, idx) => (
          <div
            key={idx}
            onMouseEnter={() => setActiveSegment(seg)}
            onMouseLeave={() => setActiveSegment(null)}
            className={`flex items-center justify-between p-2 rounded-xl text-xs transition-colors cursor-pointer ${
              activeSegment?.name === seg.name ? 'bg-slate-100 font-bold' : 'hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <span className="w-3 h-3 rounded-md shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="text-slate-800 truncate">{seg.name}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-bold text-slate-900">{seg.formatted}</span>
              <span className="text-[10px] font-mono text-slate-400">({seg.percentage}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* =========================================================================
   3. REPAYMENT LINE CHART (OUTSTANDING BALANCE)
   ========================================================================= */
interface RepaymentPoint {
  month: number;
  balance: number;
  principal: number;
  interest: number;
  emi: number;
}

interface RepaymentLineChartProps {
  schedule: RepaymentPoint[];
}

export const RepaymentLineChart: React.FC<RepaymentLineChartProps> = ({ schedule }) => {
  const shouldReduceMotion = useReducedMotion();
  const [hoveredPoint, setHoveredPoint] = useState<RepaymentPoint | null>(null);

  if (!schedule || schedule.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
        INSUFFICIENT REPAYMENT DATA
      </div>
    );
  }

  const maxBalance = Math.max(...schedule.map((p) => p.balance || p.emi * 50), 100000);
  const totalMonths = schedule[schedule.length - 1]?.month || 60;

  // Chart SVG Coordinates
  const chartW = 500;
  const chartH = 220;
  const padX = 45;
  const padY = 25;

  const getX = (m: number) => padX + (m / totalMonths) * (chartW - padX - 20);
  const getY = (bal: number) => chartH - padY - (bal / maxBalance) * (chartH - 2 * padY);

  // SVG Spline Path
  const points = schedule.map((p) => `${getX(p.month)},${getY(p.balance)}`).join(' L ');
  const areaPath = `M ${getX(schedule[0].month)},${chartH - padY} L ${points} L ${getX(schedule[schedule.length - 1].month)},${chartH - padY} Z`;

  return (
    <div className="space-y-3">
      {/* Chart Header / Selected Hover Point */}
      <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
        <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
          Loan Amortization Curve
        </span>
        {hoveredPoint ? (
          <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            Month {hoveredPoint.month}: Outstanding ₹{hoveredPoint.balance.toLocaleString('en-IN')}
          </span>
        ) : (
          <span className="text-[11px] text-slate-400">
            Tenure: {totalMonths} Months
          </span>
        )}
      </div>

      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-auto select-none">
          <defs>
            <linearGradient id="repayAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75, 1.0].map((frac, idx) => {
            const yVal = chartH - padY - frac * (chartH - 2 * padY);
            return (
              <g key={idx}>
                <line x1={padX} y1={yVal} x2={chartW - 20} y2={yVal} stroke="#e2e8f0" strokeDasharray="3 3" />
                <text x={padX - 8} y={yVal + 3} textAnchor="end" className="text-[9px] fill-slate-400 font-mono">
                  ₹{Math.round((maxBalance * frac) / 1000)}k
                </text>
              </g>
            );
          })}

          {/* Shaded Area */}
          <path d={areaPath} fill="url(#repayAreaGrad)" />

          {/* Trend Line */}
          <motion.path
            d={`M ${points}`}
            fill="none"
            stroke="#1d4ed8"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: shouldReduceMotion ? 0 : 1.2, ease: 'easeOut' }}
          />

          {/* Interactive Data Points */}
          {schedule.map((p, idx) => {
            const cx = getX(p.month);
            const cy = getY(p.balance);
            return (
              <g
                key={idx}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint(p)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={hoveredPoint?.month === p.month ? 6 : 3.5}
                  fill="#ffffff"
                  stroke="#1d4ed8"
                  strokeWidth="2"
                  className="transition-all"
                />
                {/* Month labels at bottom */}
                {(idx % 2 === 0 || idx === schedule.length - 1) && (
                  <text
                    x={cx}
                    y={chartH - 8}
                    textAnchor="middle"
                    className="text-[9px] fill-slate-400 font-mono"
                  >
                    M{p.month}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

/* =========================================================================
   4. RISK 3x3 LIKELIHOOD x IMPACT MATRIX
   ========================================================================= */
interface RiskMatrixProps {
  items: {
    id: string;
    name: string;
    category: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    likelihood: 'HIGH' | 'MEDIUM' | 'LOW';
    impact: 'HIGH' | 'MEDIUM' | 'LOW';
    mitigation: string;
  }[];
}

export const RiskMatrixGrid: React.FC<RiskMatrixProps> = ({ items }) => {
  const [selectedRisk, setSelectedRisk] = useState<any | null>(items[0] || null);

  const getCellColor = (impact: string, likelihood: string) => {
    if (impact === 'HIGH' && likelihood === 'HIGH') return 'bg-rose-100/90 border-rose-300 text-rose-900';
    if (impact === 'HIGH' || likelihood === 'HIGH') return 'bg-amber-100/80 border-amber-300 text-amber-900';
    return 'bg-emerald-50/80 border-emerald-200 text-emerald-900';
  };

  return (
    <div className="space-y-4">
      {/* 3x3 Grid Layout */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
        {['HIGH', 'MEDIUM', 'LOW'].map((impact) =>
          ['LOW', 'MEDIUM', 'HIGH'].map((likelihood) => {
            const matching = items.filter((r) => r.impact === impact && r.likelihood === likelihood);
            return (
              <div
                key={`${impact}-${likelihood}`}
                className={`p-3 rounded-xl border flex flex-col justify-between min-h-[72px] ${getCellColor(impact, likelihood)}`}
              >
                <div className="flex items-center justify-between text-[10px] opacity-75">
                  <span>Imp: {impact}</span>
                  <span>Lik: {likelihood}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1 justify-center">
                  {matching.map((r, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedRisk(r)}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold truncate max-w-full cursor-pointer ${
                        selectedRisk?.id === r.id ? 'bg-slate-900 text-white shadow-xs' : 'bg-white/80 text-slate-800'
                      }`}
                    >
                      {r.category}
                    </button>
                  ))}
                  {matching.length === 0 && (
                    <span className="text-[10px] text-slate-400 font-normal">None</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Selected Risk Mitigation Card */}
      {selectedRisk && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900">{selectedRisk.category}</span>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200">
              Severity: {selectedRisk.severity}
            </span>
          </div>
          <p className="text-slate-600 font-medium">{selectedRisk.name}</p>
          <div className="pt-1.5 border-t border-slate-200 text-slate-700">
            <strong className="text-slate-900">Mitigation: </strong>
            <span>{selectedRisk.mitigation}</span>
          </div>
        </div>
      )}
    </div>
  );
};

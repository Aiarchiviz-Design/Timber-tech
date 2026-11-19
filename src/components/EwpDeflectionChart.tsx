import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';

export interface EwpDeflectionChartProps {
  spanFt: number;
  tribWidthFt: number;
  livePsf: number;
  deadPsf: number;
  defLLLimit?: number;
  defTLLimit?: number;
  currentSection: string;
  currentPlies: number;
  deltaLL_in: number;
  deltaTL_in: number;
  wLL_plf: number;
  wTL_plf: number;
  ratioLL?: number;
  ratioTL?: number;
  status?: string;
}

export const EwpDeflectionChart: React.FC<EwpDeflectionChartProps> = ({
  spanFt = 18,
  tribWidthFt = 14,
  livePsf = 40,
  deadPsf = 15,
  defLLLimit = 480,
  defTLLimit = 360,
  currentSection = 'LVL 1-3/4x11-7/8',
  currentPlies = 2,
  deltaLL_in = 0.28,
  deltaTL_in = 0.39,
  wLL_plf = 560,
  wTL_plf = 780,
  ratioLL = 771,
  ratioTL = 554,
}) => {
  const [mode, setMode] = useState<'profile' | 'envelope'>('profile');

  const spanIn = spanFt * 12;
  const allowLL_in = Number((spanIn / (defLLLimit || 480)).toFixed(3));
  const allowTL_in = Number((spanIn / (defTLLimit || 360)).toFixed(3));

  // 1. Elastic Deflection Curve along the beam span x in [0, L]
  // delta(xi) = delta_max * (16/5) * (xi - 2*xi^3 + xi^4), where xi = x / L
  const profileData = useMemo(() => {
    const steps = 16;
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const xi = i / steps;
      const xFt = Number((xi * spanFt).toFixed(1));
      const shapeFactor = (16 / 5) * (xi - 2 * Math.pow(xi, 3) + Math.pow(xi, 4));
      const dLL = Number((deltaLL_in * shapeFactor).toFixed(3));
      const dTL = Number((deltaTL_in * shapeFactor).toFixed(3));
      pts.push({
        xFt,
        label: `${xFt} ft`,
        liveDefIn: dLL,
        totalDefIn: dTL,
        liveDefMm: Number((dLL * 25.4).toFixed(1)),
        totalDefMm: Number((dTL * 25.4).toFixed(1)),
        allowLL: allowLL_in,
        allowTL: allowTL_in,
      });
    }
    return pts;
  }, [spanFt, deltaLL_in, deltaTL_in, allowLL_in, allowTL_in]);

  // 2. Span Sensitivity Envelope (L = 8 ft to 32 ft) where delta scales as (L / spanFt)^4
  const envelopeData = useMemo(() => {
    const pts = [];
    const baseSpan = Math.max(1, spanFt);
    for (let L = 8; L <= 32; L += 2) {
      const scale4 = Math.pow(L / baseSpan, 4);
      const dLL = Number((deltaLL_in * scale4).toFixed(3));
      const dTL = Number((deltaTL_in * scale4).toFixed(3));
      const limLL = Number(((L * 12) / (defLLLimit || 480)).toFixed(3));
      const limTL = Number(((L * 12) / (defTLLimit || 360)).toFixed(3));
      pts.push({
        spanFt: L,
        label: `${L} ft`,
        liveDefIn: dLL,
        totalDefIn: dTL,
        allowLL: limLL,
        allowTL: limTL,
      });
    }
    return pts;
  }, [spanFt, deltaLL_in, deltaTL_in, defLLLimit, defTLLimit]);

  const isOverLL = deltaLL_in > allowLL_in;
  const isOverTL = deltaTL_in > allowTL_in;

  const yMaxProfile = useMemo(() => {
    const peak = Math.max(deltaTL_in, allowTL_in, 0.25);
    return Number((peak * 1.18).toFixed(2));
  }, [deltaTL_in, allowTL_in]);

  return (
    <div
      style={{
        marginTop: '6px',
        background: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: '7px',
        padding: '7px 8px 6px',
        color: '#f8fafc',
      }}
    >
      {/* Header & Mode Switch */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '4px',
          gap: '4px',
        }}
      >
        <div>
          <span
            style={{
              fontSize: '9.5px',
              fontWeight: 700,
              color: '#fbbf24',
              letterSpacing: '0.3px',
              display: 'block',
            }}
          >
            📉 LIVE DEFLECTION GRAPH (RECHARTS)
          </span>
          <span style={{ fontSize: '8.5px', color: '#94a3b8' }}>
            L={spanFt.toFixed(1)}&apos; · W_trib={tribWidthFt.toFixed(1)}&apos; · w={wTL_plf} plf ({livePsf}/{deadPsf} psf)
          </span>
        </div>
        <div
          style={{
            display: 'inline-flex',
            background: '#1e293b',
            borderRadius: '4px',
            padding: '1px',
            border: '1px solid #334155',
          }}
        >
          <button
            type="button"
            onClick={() => setMode('profile')}
            style={{
              fontSize: '8.5px',
              padding: '2px 5px',
              borderRadius: '3px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              background: mode === 'profile' ? '#d97706' : 'transparent',
              color: mode === 'profile' ? '#ffffff' : '#94a3b8',
            }}
            title="Elastic deflection curve along member length"
          >
            Elastic Curve
          </button>
          <button
            type="button"
            onClick={() => setMode('envelope')}
            style={{
              fontSize: '8.5px',
              padding: '2px 5px',
              borderRadius: '3px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              background: mode === 'envelope' ? '#0284c7' : 'transparent',
              color: mode === 'envelope' ? '#ffffff' : '#94a3b8',
            }}
            title="Deflection vs. span length curve"
          >
            Span Curve
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '4px',
          marginBottom: '5px',
          fontSize: '8.8px',
        }}
      >
        <div
          style={{
            background: '#1e293b',
            borderRadius: '4px',
            padding: '3px 6px',
            borderLeft: `3px solid ${isOverLL ? '#ef4444' : '#38bdf8'}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ color: '#cbd5e1' }}>Δ_LL (L/{ratioLL}):</span>
          <strong style={{ color: isOverLL ? '#f87171' : '#38bdf8' }}>
            {deltaLL_in.toFixed(2)}&quot; / {allowLL_in.toFixed(2)}&quot;
          </strong>
        </div>
        <div
          style={{
            background: '#1e293b',
            borderRadius: '4px',
            padding: '3px 6px',
            borderLeft: `3px solid ${isOverTL ? '#ef4444' : '#f59e0b'}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ color: '#cbd5e1' }}>Δ_TL (L/{ratioTL}):</span>
          <strong style={{ color: isOverTL ? '#f87171' : '#fbbf24' }}>
            {deltaTL_in.toFixed(2)}&quot; / {allowTL_in.toFixed(2)}&quot;
          </strong>
        </div>
      </div>

      {/* Recharts Graph Container */}
      <div style={{ width: '100%', height: 128 }}>
        <ResponsiveContainer width="100%" height="100%">
          {mode === 'profile' ? (
            <ComposedChart data={profileData} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="ewpTotalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.42} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.04} />
                </linearGradient>
                <linearGradient id="ewpLiveGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.38} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="xFt"
                tick={{ fontSize: 8.5, fill: '#94a3b8' }}
                tickFormatter={(v) => `${v}'`}
                stroke="#334155"
              />
              <YAxis
                domain={[0, yMaxProfile]}
                reversed
                tick={{ fontSize: 8.5, fill: '#94a3b8' }}
                tickFormatter={(v) => `${v}"`}
                stroke="#334155"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #475569',
                  borderRadius: '5px',
                  fontSize: '9px',
                  color: '#f8fafc',
                  padding: '4px 7px',
                }}
                formatter={(value: any, name: string) => [
                  `${Number(value).toFixed(3)}" (${(Number(value) * 25.4).toFixed(1)} mm)`,
                  name === 'totalDefIn'
                    ? 'Total Load Δ_TL'
                    : name === 'liveDefIn'
                    ? 'Live Load Δ_LL'
                    : name,
                ]}
                labelFormatter={(label) => `Position x = ${label} ft along ${ currentPlies }-Ply ${currentSection}`}
              />
              <ReferenceLine
                y={allowTL_in}
                stroke="#ef4444"
                strokeDasharray="4 3"
                strokeWidth={1.2}
                label={{
                  value: `L/${defTLLimit} (${allowTL_in}")`,
                  position: 'insideBottomRight',
                  fill: '#f87171',
                  fontSize: 8,
                }}
              />
              <ReferenceLine
                y={allowLL_in}
                stroke="#38bdf8"
                strokeDasharray="3 3"
                strokeWidth={1}
                label={{
                  value: `L/${defLLLimit} (${allowLL_in}")`,
                  position: 'insideTopLeft',
                  fill: '#7dd3fc',
                  fontSize: 8,
                }}
              />
              <Area
                type="monotone"
                dataKey="totalDefIn"
                stroke="#f59e0b"
                strokeWidth={2}
                fill="url(#ewpTotalGrad)"
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="liveDefIn"
                stroke="#38bdf8"
                strokeWidth={1.8}
                fill="url(#ewpLiveGrad)"
                isAnimationActive={false}
              />
            </ComposedChart>
          ) : (
            <ComposedChart data={envelopeData} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="spanFt"
                tick={{ fontSize: 8.5, fill: '#94a3b8' }}
                tickFormatter={(v) => `${v}'`}
                stroke="#334155"
              />
              <YAxis
                tick={{ fontSize: 8.5, fill: '#94a3b8' }}
                tickFormatter={(v) => `${v}"`}
                stroke="#334155"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #475569',
                  borderRadius: '5px',
                  fontSize: '9px',
                  color: '#f8fafc',
                  padding: '4px 7px',
                }}
                formatter={(value: any, name: string) => [
                  `${Number(value).toFixed(3)}" (${(Number(value) * 25.4).toFixed(1)} mm)`,
                  name === 'totalDefIn'
                    ? 'Total Load Δ_TL'
                    : name === 'liveDefIn'
                    ? 'Live Load Δ_LL'
                    : name === 'allowTL'
                    ? `Allowable L/${defTLLimit}`
                    : name,
                ]}
                labelFormatter={(label) => `Clear Span L = ${label} ft`}
              />
              <ReferenceLine
                x={Math.round(spanFt / 2) * 2}
                stroke="#22c55e"
                strokeDasharray="3 3"
                strokeWidth={1.4}
                label={{
                  value: `${spanFt.toFixed(1)}'`,
                  position: 'top',
                  fill: '#4ade80',
                  fontSize: 8,
                }}
              />
              <Line
                type="monotone"
                dataKey="allowTL"
                stroke="#ef4444"
                strokeDasharray="4 3"
                strokeWidth={1.3}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="totalDefIn"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 2, fill: '#f59e0b' }}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="liveDefIn"
                stroke="#38bdf8"
                strokeWidth={1.8}
                dot={{ r: 1.5, fill: '#38bdf8' }}
                isAnimationActive={false}
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

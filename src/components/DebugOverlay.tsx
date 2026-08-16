import React from 'react';
import { EngineDebugInfo, QualityLevel } from '../engine/types';
import { Activity, Sliders, X, ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';

interface DebugOverlayProps {
  debugInfo: EngineDebugInfo;
  isOpen: boolean;
  onClose: () => void;
  onQualityChange: (quality: QualityLevel) => void;
  onTestTurn?: (direction: 'forward' | 'backward') => void;
}

export const DebugOverlay: React.FC<DebugOverlayProps> = ({
  debugInfo,
  isOpen,
  onClose,
  onQualityChange,
  onTestTurn,
}) => {
  if (!isOpen) return null;

  const healthColor =
    debugInfo.meshHealthStatus === 'valid'
      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
      : debugInfo.meshHealthStatus === 'warning'
      ? 'bg-amber-950/80 text-amber-300 border-amber-700/60'
      : 'bg-rose-950/80 text-rose-300 border-rose-700/60';

  const HealthIcon =
    debugInfo.meshHealthStatus === 'valid'
      ? ShieldCheck
      : debugInfo.meshHealthStatus === 'warning'
      ? AlertTriangle
      : AlertOctagon;

  return (
    <div
      id="debug-overlay-panel"
      className="fixed bottom-16 right-4 z-50 w-84 bg-stone-900/95 text-stone-200 backdrop-blur-md rounded-xl p-4 shadow-2xl border border-stone-700/80 font-mono text-xs select-none max-h-[85vh] overflow-y-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-stone-700/80">
        <div className="flex items-center gap-1.5 font-bold text-amber-400">
          <Activity className="w-4 h-4" />
          <span>Paper Physics Engine</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-stone-800 rounded text-stone-400 hover:text-white transition-colors"
          title="Close Debug Panel"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Mesh Health Badge */}
      <div className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border mb-3 text-[11px] font-bold ${healthColor}`}>
        <div className="flex items-center gap-1.5">
          <HealthIcon className="w-4 h-4" />
          <span>Mesh Invariant Health:</span>
        </div>
        <span className="uppercase tracking-wider text-[10px]">
          {debugInfo.meshHealthStatus}
        </span>
      </div>

      {/* Real-time Telemetry Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-stone-800/80 p-2 rounded border border-stone-700/50">
          <span className="text-[10px] text-stone-400 block uppercase">Framerate</span>
          <span className={`text-base font-bold ${debugInfo.fps >= 55 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {debugInfo.fps} FPS
          </span>
          <span className="text-[9px] text-stone-400 block">{debugInfo.frameTimeMs} ms/frame</span>
        </div>

        <div className="bg-stone-800/80 p-2 rounded border border-stone-700/50">
          <span className="text-[10px] text-stone-400 block uppercase">Pipeline</span>
          <span className="text-sm font-bold text-cyan-300 uppercase">{debugInfo.renderMode}</span>
          <span className="text-[9px] text-stone-400 block">{debugInfo.meshRes}</span>
        </div>
      </div>

      {/* Physics State */}
      <div className="space-y-1.5 bg-stone-800/60 p-2.5 rounded border border-stone-700/50 mb-3 text-[11px]">
        <div className="flex justify-between items-center">
          <span className="text-stone-400">Gesture State:</span>
          <span className="font-bold text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/50 text-[10px]">
            {debugInfo.gestureState} ({debugInfo.turnDirection || 'none'})
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-stone-400">Turn Progress:</span>
          <span className="font-bold text-stone-200">
            {Math.round(debugInfo.progress * 100)}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-stone-700/60 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-amber-400 h-full transition-all duration-75"
            style={{ width: `${Math.min(100, Math.max(0, debugInfo.progress * 100))}%` }}
          />
        </div>

        <div className="flex justify-between items-center pt-1">
          <span className="text-stone-400">Curl Radius (R):</span>
          <span className="text-stone-200">{debugInfo.curlRadius}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-stone-400">Pointer Velocity:</span>
          <span className="text-stone-200">{debugInfo.velocity} px/ms</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-stone-400">Stretch Constraint:</span>
          <span className="text-emerald-400 font-mono">
            {debugInfo.stretchError !== undefined ? `< ${(debugInfo.stretchError * 100).toFixed(2)}% ΔL` : '0.00%'}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-stone-400">Spine Attachment Error:</span>
          <span className="text-emerald-400 font-mono">
            {debugInfo.spineError !== undefined ? `${(debugInfo.spineError).toFixed(4)}` : '0.0000'}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-stone-400">Max Vertex Displacement:</span>
          <span className="text-stone-200 font-mono">
            {debugInfo.maxDisplacement !== undefined ? `${debugInfo.maxDisplacement.toFixed(3)}` : '0.000'}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-stone-400">Triangle Distortion:</span>
          <span className="text-stone-200 font-mono">
            {debugInfo.triangleDistortion !== undefined ? `${debugInfo.triangleDistortion.toFixed(2)}x` : '1.00x'}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-stone-400">Invalid Vertices:</span>
          <span className={debugInfo.invalidVertexCount === 0 ? 'text-emerald-400' : 'text-rose-400 font-bold'}>
            {debugInfo.invalidVertexCount ?? 0}
          </span>
        </div>

        <div className="flex justify-between items-center pt-1 border-t border-stone-700/40">
          <span className="text-stone-400">Grab / Pointer:</span>
          <span className="text-stone-300 text-[10px]">
            ({debugInfo.grabPoint?.x.toFixed(2)}, {debugInfo.grabPoint?.y.toFixed(2)}) → ({debugInfo.currentPointer?.x.toFixed(2)}, {debugInfo.currentPointer?.y.toFixed(2)})
          </span>
        </div>
      </div>

      {/* Quality Level Selector */}
      <div className="mb-3">
        <span className="text-[10px] text-stone-400 uppercase block mb-1.5 flex items-center gap-1">
          <Sliders className="w-3 h-3" /> Adaptive Quality Level
        </span>
        <div className="grid grid-cols-3 gap-1">
          {(['HIGH', 'MEDIUM', 'LOW'] as QualityLevel[]).map((q) => (
            <button
              key={q}
              onClick={() => onQualityChange(q)}
              className={`py-1 text-[10px] font-bold rounded transition-colors ${
                debugInfo.quality === q
                  ? 'bg-amber-500 text-stone-950 shadow'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Test Actions */}
      {onTestTurn && (
        <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-stone-800">
          <button
            onClick={() => onTestTurn('backward')}
            className="py-1 px-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-[10px] rounded flex items-center justify-center gap-1 transition-colors"
          >
            ← Flip Prev
          </button>
          <button
            onClick={() => onTestTurn('forward')}
            className="py-1 px-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-[10px] rounded flex items-center justify-center gap-1 transition-colors"
          >
            Flip Next →
          </button>
        </div>
      )}
    </div>
  );
};

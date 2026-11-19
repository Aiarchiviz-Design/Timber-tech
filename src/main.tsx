import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import App from './App.tsx';
import { TrussElevationView } from './components/TrussElevationView.tsx';
import { EwpDeflectionChart, type EwpDeflectionChartProps } from './components/EwpDeflectionChart.tsx';
import type { TrussStructure, TimberSection } from './types/trussElevation.ts';
import {
  createSampleFinkTruss,
  createTR003Truss,
  recalculateTrussMembers,
  autoResolveAllTrusses,
  create20TrussesCatalog,
  type WebOptimizationMode,
} from './services/trussStressEngine.ts';
import './index.css';

// Mount standalone app if #root element is present
const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(<App />);
}

// Global bridge for BIM CAD interface integration
declare global {
  interface Window {
    openTrussElevationModal: (initialTruss?: TrussStructure) => void;
    mountTrussElevationViewTab: (container: HTMLElement) => void;
    renderTrussElevationView: (
      container: HTMLElement,
      truss: TrussStructure,
      onUpdate?: (memberId: string, section: TimberSection) => void
    ) => Root;
    createSampleFinkTruss: () => TrussStructure;
    createTR003Truss: () => TrussStructure;
    autoResolveAllTrusses: (catalog: { [id: string]: TrussStructure }, webMode?: WebOptimizationMode) => { [id: string]: TrussStructure };
    runAutoAnalysisOnAllTrusses: (webMode?: WebOptimizationMode) => void;
    cadtechProjectTrussStore?: { [id: string]: TrussStructure };
    updateEwpDeflectionChart?: (props: EwpDeflectionChartProps) => void;
  }
}

let activeModalRoot: Root | null = null;
let activeTabRoot: Root | null = null;
let ewpChartRoot: Root | null = null;
let ewpChartContainer: HTMLElement | null = null;

window.updateEwpDeflectionChart = function(props: EwpDeflectionChartProps) {
  const el = document.getElementById('hud-deflection-chart-mount');
  if (!el) return;
  if (!ewpChartRoot || ewpChartContainer !== el) {
    ewpChartContainer = el;
    ewpChartRoot = createRoot(el);
  }
  ewpChartRoot.render(<EwpDeflectionChart {...props} />);
};

if (typeof (window as any).updateEWPBeamHUD === 'function') {
  try {
    (window as any).updateEWPBeamHUD();
  } catch (_) {}
}

function ModalTrussWrapper({ initialTruss }: { initialTruss?: TrussStructure }) {
  const [truss, setTruss] = React.useState<TrussStructure>(initialTruss || createTR003Truss());

  const handleUpdateMember = (memberId: string, section: TimberSection) => {
    setTruss(prev => {
      const updated = recalculateTrussMembers({
        ...prev,
        members: prev.members.map(m => m.id === memberId ? { ...m, section } : m),
      });
      return updated;
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto h-[82vh]">
      <TrussElevationView initialTruss={truss} onUpdateMemberSection={handleUpdateMember} />
    </div>
  );
}

window.createSampleFinkTruss = createSampleFinkTruss;
window.createTR003Truss = createTR003Truss;
window.autoResolveAllTrusses = autoResolveAllTrusses;

window.openTrussElevationModal = function(initialTruss?: TrussStructure) {
  const modal = document.getElementById('modal') as HTMLDialogElement | null;
  const title = document.getElementById('modal-title');
  const body = document.getElementById('modal-body');

  if (title) title.textContent = '2D Roof Truss Elevation & Stress Inspector (ASD / NDS / EC5)';
  if (body) {
    body.innerHTML = '<div id="truss-elevation-modal-mount" class="w-full h-full"></div>';
    const mountEl = document.getElementById('truss-elevation-modal-mount');
    if (mountEl) {
      if (activeModalRoot) {
        try { activeModalRoot.unmount(); } catch (_) {}
      }
      activeModalRoot = createRoot(mountEl);
      activeModalRoot.render(<ModalTrussWrapper initialTruss={initialTruss} />);
    }
  }

  if (modal && typeof modal.showModal === 'function') {
    modal.showModal();
  }
};

window.mountTrussElevationViewTab = function(container: HTMLElement) {
  if (!activeTabRoot) {
    activeTabRoot = createRoot(container);
  }
  activeTabRoot.render(<TrussElevationView />);
};

// Check if panel is already unhidden and mount immediately
const initialPanel = document.getElementById('truss-elevation-panel');
if (initialPanel && !initialPanel.classList.contains('hidden')) {
  window.mountTrussElevationViewTab(initialPanel);
}

window.renderTrussElevationView = function(
  container: HTMLElement,
  truss: TrussStructure,
  onUpdate?: (memberId: string, section: TimberSection) => void
) {
  const root = createRoot(container);
  root.render(<TrussElevationView initialTruss={truss} onUpdateMemberSection={onUpdate} />);
  return root;
};

window.runAutoAnalysisOnAllTrusses = function(webMode: WebOptimizationMode = 'auto') {
  const currentCatalog = window.cadtechProjectTrussStore || create20TrussesCatalog();
  const resolvedCatalog = autoResolveAllTrusses(currentCatalog, webMode);
  window.cadtechProjectTrussStore = resolvedCatalog;

  if (typeof (window as any).cadtechRunAutoTrussAnalysis === 'function') {
    try {
      (window as any).cadtechRunAutoTrussAnalysis({ snow: 0, webOptimizationMode: webMode });
    } catch (_) {}
  }

  // Re-render tab or modal if open
  const panel = document.getElementById('truss-elevation-panel');
  if (panel && !panel.classList.contains('hidden')) {
    window.mountTrussElevationViewTab(panel);
  }

  if (typeof (window as any).render === 'function') {
    (window as any).render();
  }
  if (typeof (window as any).toast === 'function') {
    (window as any).toast(`⚡ Auto Analysis (${webMode.toUpperCase()} WEBs): All project roof trusses sized & calculated to PASS (ASD/NDS 2024)`);
  }
};


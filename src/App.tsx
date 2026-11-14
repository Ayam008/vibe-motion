import { useState } from 'react';
import { Header } from './components/Header';
import { StudioTabs } from './components/StudioTabs';
import type { TabType } from './components/StudioTabs';
import { CanvasStudio } from './components/CanvasStudio/CanvasStudio';
import { SvgStudio } from './components/SvgStudio/SvgStudio';
import { PromptStudio } from './components/PromptStudio/PromptStudio';
import { BulkQueue } from './components/BulkQueue/BulkQueue';
import { HelpModal } from './components/HelpModal';
import type { QueueItem } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('canvas');
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [customCanvasCode, setCustomCanvasCode] = useState<string | null>(null);

  // Add an item to the bulk queue
  const handleAddToQueue = (item: Omit<QueueItem, 'id' | 'status' | 'progress'>) => {
    const newItem: QueueItem = {
      ...item,
      id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      status: 'idle',
      progress: 0
    };
    setQueue((prev) => [...prev, newItem]);
  };

  const handleRemoveFromQueue = (id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearQueue = () => {
    setQueue([]);
  };

  const handleUpdateItemStatus = (
    id: string,
    status: QueueItem['status'],
    progress: number,
    error?: string
  ) => {
    setQueue((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status, progress, error } : item
      )
    );
  };

  const handleSendCodeToStudio = (newCode: string) => {
    setCustomCanvasCode(newCode);
    setActiveTab('canvas');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      {/* Navigation Header */}
      <Header queueCount={queue.length} onOpenHelp={() => setIsHelpOpen(true)} />

      {/* Studio Navigation Tabs */}
      <StudioTabs
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        queueCount={queue.length}
      />

      {/* Main Studio Viewport */}
      <main className="flex-1 pb-16">
        {activeTab === 'canvas' && (
          <CanvasStudio
            onAddToQueue={handleAddToQueue}
            externalCode={customCanvasCode}
          />
        )}
        {activeTab === 'svg' && <SvgStudio onAddToQueue={handleAddToQueue} />}
        {activeTab === 'prompt' && <PromptStudio onSendCodeToStudio={handleSendCodeToStudio} />}
        {activeTab === 'queue' && (
          <BulkQueue
            queue={queue}
            onRemoveItem={handleRemoveFromQueue}
            onClearQueue={handleClearQueue}
            onUpdateItemStatus={handleUpdateItemStatus}
          />
        )}
      </main>

      {/* Footer Info */}
      <footer className="border-t border-slate-900 bg-slate-950 px-4 py-4 text-center text-xs text-slate-500 flex flex-wrap items-center justify-between gap-4 max-w-[1700px] mx-auto w-full">
        <div>
          MotionForge Studio • In-Browser WebCodecs Video GPU Acceleration
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>H.264 MP4</span>
          <span>•</span>
          <span>32-bit Alpha WebM</span>
          <span>•</span>
          <span>Lossless PNG Sequence</span>
          <span>•</span>
          <span>Batch ZIP Export</span>
        </div>
      </footer>

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}

export default App;

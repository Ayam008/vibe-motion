import { Sparkles, FileCode2, Wand2, Layers } from 'lucide-react';

export type TabType = 'canvas' | 'svg' | 'prompt' | 'queue';

interface StudioTabsProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  queueCount: number;
}

export const StudioTabs: React.FC<StudioTabsProps> = ({ activeTab, onChangeTab, queueCount }) => {
  const tabs = [
    {
      id: 'canvas' as TabType,
      label: 'Canvas Studio',
      icon: Sparkles,
      desc: 'Stock Video & Motion Footage'
    },
    {
      id: 'svg' as TabType,
      label: 'SVG Motion Studio',
      icon: FileCode2,
      desc: 'Vector Icons & Alpha Overlay'
    },
    {
      id: 'prompt' as TabType,
      label: 'AI Prompt Studio',
      icon: Wand2,
      desc: 'Microstock Generator & Direct AI'
    },
    {
      id: 'queue' as TabType,
      label: 'Bulk Render & ZIP',
      icon: Layers,
      desc: 'Batch Export Massal',
      badge: queueCount > 0 ? queueCount : undefined
    }
  ];

  return (
    <div className="flex border-b border-slate-800 bg-slate-900/50 px-4 lg:px-8 gap-2 overflow-x-auto scrollbar-none">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChangeTab(tab.id)}
            className={`flex items-center gap-2.5 px-4 py-3 border-b-2 text-sm font-medium transition-all whitespace-nowrap ${
              isActive
                ? 'border-cyan-400 text-cyan-300 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500 text-slate-950">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

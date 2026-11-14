export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3' | '21:9';

export type ResolutionPreset = '720p' | '1080p' | '2K' | '4K';

export type ExportFormat = 'mp4' | 'webm_alpha' | 'png_sequence';

export interface StudioConfig {
  duration: number; // in seconds
  fps: number;
  width: number;
  height: number;
  aspectRatio: AspectRatio;
  resolution: ResolutionPreset;
  format: ExportFormat;
  bitrateMbps: number;
  autoLoop: boolean;
}

export interface PresetItem {
  id: string;
  name: string;
  category: string;
  description: string;
  code: string;
  defaultDuration?: number;
}

export interface QueueItem {
  id: string;
  name: string;
  type: 'canvas' | 'svg';
  code: string;
  duration: number;
  fps: number;
  width: number;
  height: number;
  format: ExportFormat;
  status: 'idle' | 'rendering' | 'completed' | 'error';
  progress: number;
  blob?: Blob;
  error?: string;
}

export interface RenderProgress {
  currentFrame: number;
  totalFrames: number;
  percentage: number;
  fps: number;
  etaSeconds: number;
}

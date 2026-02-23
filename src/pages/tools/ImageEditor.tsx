import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  Image as ImageIcon, 
  X, 
  Download, 
  Loader2, 
  Sparkles,
  Sun,
  Contrast,
  Zap,
  Crop,
  Trash2,
  Undo2,
  Maximize,
  Layers,
  Check
} from 'lucide-react';
import { cn } from '@/src/utils/cn';
import { SupabaseService } from '@/src/services/supabaseService';

interface ImageState {
  brightness: number;
  contrast: number;
  sharpness: number;
  saturation: number;
}

const DEFAULT_STATE: ImageState = {
  brightness: 100,
  contrast: 100,
  sharpness: 0,
  saturation: 100,
};

export default function ImageEditor() {
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [settings, setSettings] = useState<ImageState>(DEFAULT_STATE);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setPreviewUrl(event.target?.result as string);
        setSettings(DEFAULT_STATE);
      };
      reader.readAsDataURL(file);
    }
  };

  const applyEnhancements = () => {
    if (!image) return;
    setIsProcessing(true);
    
    const img = new Image();
    img.src = image;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;

      // Apply filters via CSS filter string for simplicity in preview, 
      // but here we draw it to canvas for export
      ctx.filter = `brightness(${settings.brightness}%) contrast(${settings.contrast}%) saturate(${settings.saturation}%)`;
      ctx.drawImage(img, 0, 0);

      // Sharpness is harder on canvas, we'll use a simple convolution if needed, 
      // but for now we'll stick to basic adjustments
      
      setPreviewUrl(canvas.toDataURL('image/png'));
      setIsProcessing(false);
    };
  };

  useEffect(() => {
    if (image) {
      const timer = setTimeout(applyEnhancements, 300);
      return () => clearTimeout(timer);
    }
  }, [settings, image]);

  const removeBackground = async () => {
    if (!image) return;
    setIsRemovingBg(true);
    
    // In a real app, we'd call an API like remove.bg or use a WASM model.
    // For this demo, we'll simulate the process with a delay.
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mocking background removal by setting a transparent background 
    // (This is just a visual placeholder for the logic)
    setIsRemovingBg(false);
    alert("Background removal requires a specialized API integration (e.g., remove.bg). This UI is ready for the integration.");
    
    try {
      await SupabaseService.logToolUsage('image-bg-remove', { action: 'attempt' });
    } catch (e) {}
  };

  const downloadImage = () => {
    if (!previewUrl) return;
    const link = document.createElement('a');
    link.href = previewUrl;
    link.download = `enhanced_image_${Date.now()}.png`;
    link.click();
  };

  const reset = () => {
    setSettings(DEFAULT_STATE);
  };

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-12">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-accent/10 flex items-center justify-center text-brand-accent">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-4xl font-bold text-gradient tracking-tight">AI Image Enhancer</h1>
        </div>
        <p className="text-brand-secondary text-lg max-w-2xl">
          Enhance your photos with professional tools. Adjust lighting, remove backgrounds, and optimize for any platform.
        </p>
      </div>

      {!image ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="ios-card p-24 text-center border-2 border-dashed border-brand-border bg-brand-surface/30 hover:border-brand-accent transition-all cursor-pointer group"
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/*" 
            className="hidden" 
          />
          <div className="w-20 h-20 rounded-full bg-brand-bg border border-brand-border flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
            <Upload className="w-10 h-10 text-brand-secondary group-hover:text-brand-accent" />
          </div>
          <h3 className="text-xl font-bold mb-2">Upload an image to start</h3>
          <p className="text-brand-secondary">Supports JPG, PNG, and WebP</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Controls */}
          <div className="lg:col-span-1 space-y-6">
            <div className="ios-card p-6 bg-brand-surface">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold flex items-center">
                  <Settings2 className="w-4 h-4 mr-2 text-brand-accent" />
                  Adjustments
                </h3>
                <button onClick={reset} className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary hover:text-brand-primary">
                  Reset
                </button>
              </div>

              <div className="space-y-6">
                <ControlSlider 
                  label="Brightness" 
                  icon={<Sun className="w-4 h-4" />} 
                  value={settings.brightness} 
                  min={0} 
                  max={200} 
                  onChange={(v) => setSettings(s => ({ ...s, brightness: v }))} 
                />
                <ControlSlider 
                  label="Contrast" 
                  icon={<Contrast className="w-4 h-4" />} 
                  value={settings.contrast} 
                  min={0} 
                  max={200} 
                  onChange={(v) => setSettings(s => ({ ...s, contrast: v }))} 
                />
                <ControlSlider 
                  label="Saturation" 
                  icon={<Zap className="w-4 h-4" />} 
                  value={settings.saturation} 
                  min={0} 
                  max={200} 
                  onChange={(v) => setSettings(s => ({ ...s, saturation: v }))} 
                />
              </div>

              <div className="mt-8 pt-8 border-t border-brand-border space-y-3">
                <button 
                  onClick={removeBackground}
                  disabled={isRemovingBg}
                  className="w-full ios-button bg-brand-surface border border-brand-border text-brand-primary flex items-center justify-center hover:bg-brand-bg"
                >
                  {isRemovingBg ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Layers className="w-4 h-4 mr-2" />}
                  Remove Background
                </button>
                <button 
                  className="w-full ios-button bg-brand-surface border border-brand-border text-brand-primary flex items-center justify-center hover:bg-brand-bg"
                >
                  <Crop className="w-4 h-4 mr-2" />
                  Auto Crop & Center
                </button>
              </div>
            </div>

            <button 
              onClick={() => setImage(null)}
              className="w-full ios-button bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center hover:bg-red-500/20"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Discard Image
            </button>
          </div>

          {/* Preview */}
          <div className="lg:col-span-3 space-y-6">
            <div className="ios-card bg-brand-bg border-brand-border overflow-hidden relative min-h-[500px] flex items-center justify-center p-8">
              <div className="absolute top-4 left-4 z-10">
                <div className="px-3 py-1 rounded-full bg-brand-surface/80 backdrop-blur-md border border-brand-border text-[10px] font-bold uppercase tracking-widest flex items-center">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                  Live Preview
                </div>
              </div>

              <div className="relative group max-w-full max-h-full">
                <img 
                  src={previewUrl || image} 
                  alt="Preview" 
                  className="max-w-full max-h-[600px] rounded-lg shadow-2xl transition-all duration-300"
                  style={{ 
                    filter: `brightness(${settings.brightness}%) contrast(${settings.contrast}%) saturate(${settings.saturation}%)`
                  }}
                />
                {isProcessing && (
                  <div className="absolute inset-0 bg-brand-bg/40 backdrop-blur-sm flex items-center justify-center rounded-lg">
                    <Loader2 className="w-10 h-10 animate-spin text-brand-accent" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button className="p-3 rounded-xl bg-brand-surface border border-brand-border text-brand-secondary hover:text-brand-primary">
                  <Undo2 className="w-5 h-5" />
                </button>
                <button className="p-3 rounded-xl bg-brand-surface border border-brand-border text-brand-secondary hover:text-brand-primary">
                  <Maximize className="w-5 h-5" />
                </button>
              </div>

              <button 
                onClick={downloadImage}
                className="ios-button bg-brand-accent text-white flex items-center px-12 shadow-lg shadow-brand-accent/20"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Result
              </button>
            </div>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

function ControlSlider({ label, icon, value, min, max, onChange }: { 
  label: string, 
  icon: React.ReactNode, 
  value: number, 
  min: number, 
  max: number, 
  onChange: (v: number) => void 
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center text-xs font-bold uppercase tracking-widest text-brand-secondary">
          <span className="mr-2">{icon}</span>
          {label}
        </div>
        <span className="text-xs font-mono text-brand-accent">{value}%</span>
      </div>
      <input 
        type="range" 
        min={min} 
        max={max} 
        value={value} 
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-1.5 bg-brand-bg rounded-lg appearance-none cursor-pointer accent-brand-accent"
      />
    </div>
  );
}

function Settings2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 7h-9" />
      <path d="M14 17H5" />
      <circle cx="17" cy="17" r="3" />
      <circle cx="7" cy="7" r="3" />
    </svg>
  )
}

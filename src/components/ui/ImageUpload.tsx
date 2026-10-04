'use client';

import * as React from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { Upload, X, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  bucket?: 'scholarship-covers' | 'provider-logos' | 'guide-images';
  maxSizeMB?: number;
  label?: string;
  isArabic?: boolean;
}

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/svg+xml',
];

export function ImageUpload({
  value,
  onChange,
  bucket = 'scholarship-covers',
  maxSizeMB = 5,
  label,
  isArabic = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [urlInput, setUrlInput] = React.useState(value || '');
  const [showUrlField, setShowUrlField] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setError(
        isArabic
          ? 'صيغة الملف غير مدعومة. الصيغ المقبولة: JPG, PNG, WebP, AVIF, SVG'
          : 'Unsupported file type. Accepted: JPG, PNG, WebP, AVIF, SVG'
      );
      return;
    }

    // Validate file size
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(
        isArabic
          ? `حجم الملف يتجاوز الحد الأقصى المسموح به (${maxSizeMB} ميجابايت).`
          : `File size exceeds the maximum limit of ${maxSizeMB}MB.`
      );
      return;
    }

    setUploading(true);

    const supabase = createClient();
    if (isSupabaseConfigured && supabase) {
      try {
        const fileExt = file.name.split('.').pop() || 'png';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          setError(uploadError.message);
          setUploading(false);
          return;
        }

        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);

        onChange(publicUrl);
        setUrlInput(publicUrl);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setUploading(false);
      }
    } else {
      // Local development preview fallback
      const objectUrl = URL.createObjectURL(file);
      onChange(objectUrl);
      setUrlInput(objectUrl);
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange(null);
    setUrlInput('');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setShowUrlField(false);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          {label}
        </label>
      )}

      {error && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {value ? (
        <div className="relative group rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center p-2 max-w-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Preview"
            className="max-h-36 w-auto object-contain rounded-xl"
            onError={() => {
              setError(
                isArabic
                  ? 'تعذر تحميل معاينة الصورة. يرجى التحقق من الرابط.'
                  : 'Failed to load image preview. Please check URL.'
              );
            }}
          />
          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl bg-white/90 text-slate-800 hover:bg-white text-xs font-semibold shadow-xs flex items-center gap-1"
              title={isArabic ? 'استبدال الصورة' : 'Replace Image'}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{isArabic ? 'استبدال' : 'Replace'}</span>
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 rounded-xl bg-rose-600/90 text-white hover:bg-rose-600 text-xs font-semibold shadow-xs flex items-center gap-1"
              title={isArabic ? 'إزالة الصورة' : 'Remove Image'}
            >
              <X className="w-3.5 h-3.5" />
              <span>{isArabic ? 'إزالة' : 'Remove'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 hover:border-emerald-500/60 rounded-2xl p-6 text-center cursor-pointer bg-slate-50/50 hover:bg-emerald-50/20 transition-all flex flex-col items-center justify-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 group-hover:border-emerald-200 transition-colors shadow-2xs">
              {uploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Upload className="w-5 h-5" />
              )}
            </div>
            <p className="text-xs font-semibold text-slate-700">
              {isArabic ? 'انقر لرفع صورة من جهازك' : 'Click to upload image'}
            </p>
            <p className="text-[11px] text-slate-400">
              {isArabic
                ? `الصيغ المدعومة: JPG, PNG, WebP (بحد أقصى ${maxSizeMB} ميجابايت)`
                : `JPG, PNG, WebP up to ${maxSizeMB}MB`}
            </p>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={() => setShowUrlField(!showUrlField)}
              className="text-emerald-700 hover:underline font-semibold"
            >
              {showUrlField
                ? isArabic ? 'إخفاء إدخال الرابط' : 'Hide direct URL input'
                : isArabic ? 'أو أدخل رابط الصورة مباشرة' : 'Or provide image URL directly'}
            </button>
          </div>

          {showUrlField && (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-emerald-600"
              />
              <Button type="button" variant="outline" size="sm" onClick={handleApplyUrl}>
                {isArabic ? 'تطبيق' : 'Apply'}
              </Button>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_MIME_TYPES.join(',')}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}

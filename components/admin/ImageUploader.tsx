"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, X, GripVertical, Loader2 } from "lucide-react";
import { ProductImage } from "@/components/product/ProductImage";
import { cn } from "@/lib/cn";
import { toast } from "@/components/ui/Toast";

export function ImageUploader({
  value,
  onChange,
}: {
  value: string[];
  onChange: (images: string[]) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (list.length === 0) return;
      setUploading((n) => n + list.length);
      const uploaded: string[] = [];
      await Promise.all(
        list.map(async (file) => {
          try {
            const fd = new FormData();
            fd.append("file", file);
            const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Upload failed");
            uploaded.push(json.url as string);
          } catch (e) {
            toast(`${file.name}: ${e instanceof Error ? e.message : "upload failed"}`, "error");
          } finally {
            setUploading((n) => n - 1);
          }
        }),
      );
      if (uploaded.length > 0) {
        onChange([...value, ...uploaded]);
        toast(`Uploaded ${uploaded.length} image${uploaded.length === 1 ? "" : "s"}`, "success");
      }
    },
    [value, onChange],
  );

  const remove = (idx: number) => onChange(value.filter((_, i) => i !== idx));

  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.length) return;
    const next = value.slice();
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed bg-mj-ivory px-6 py-8 text-center cursor-pointer transition-colors",
          dragOver ? "border-mj-gold-500 bg-mj-gold-100/40" : "border-mj-line hover:border-mj-gold-300",
        )}
      >
        {uploading > 0 ? (
          <Loader2 className="size-8 text-mj-gold-600 animate-spin" />
        ) : (
          <Upload className="size-8 text-mj-mute" />
        )}
        <p className="font-display text-base text-mj-ink">
          {uploading > 0 ? `Uploading ${uploading} file${uploading === 1 ? "" : "s"}…` : "Drop images here or click to upload"}
        </p>
        <p className="text-xs text-mj-mute">JPG, PNG, WebP up to ~10 MB each</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {value.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {value.map((src, i) => (
            <div
              key={src + i}
              className="relative group mj-card overflow-hidden bg-mj-cream aspect-square"
            >
              <ProductImage src={src} alt={`Image ${i + 1}`} />
              {i === 0 && (
                <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-mj-maroon-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-mj-gold-200">
                  Primary
                </span>
              )}
              <div className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => move(i, i - 1)}
                    disabled={i === 0}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-mj-ink hover:bg-mj-gold-200 disabled:opacity-30"
                    title="Move earlier"
                  >
                    <GripVertical className="size-3.5 -rotate-90" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, i + 1)}
                    disabled={i === value.length - 1}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-mj-ink hover:bg-mj-gold-200 disabled:opacity-30"
                    title="Move later"
                  >
                    <GripVertical className="size-3.5 rotate-90" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-mj-maroon-700 hover:bg-mj-maroon-700 hover:text-mj-ivory"
                  title="Remove"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-2 text-[11px] text-mj-mute">
        First image is the primary one shown on cards. Drag to reorder, hover to remove.
      </p>
    </div>
  );
}

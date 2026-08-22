"use client";

import { useRef, useState } from "react";
import { Camera, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CameraCaptureProps {
  onCapture: (base64: string) => void;
  children?: React.ReactNode;
}

export function CameraCapture({ onCapture, children }: CameraCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreview(result);
      onCapture(result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      {children}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        ref={inputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <div className="flex gap-3">
        <Button
          type="button"
          size="lg"
          onClick={() => inputRef.current?.click()}
          className="flex-1 rounded-full bg-[#e74c3c] text-white shadow-md hover:bg-[#c0392b]"
        >
          <Camera className="mr-2 h-5 w-5" />
          Camera
        </Button>
        <Button
          type="button"
          size="lg"
          variant="outline"
          onClick={() => {
            const el = inputRef.current;
            if (el) {
              el.removeAttribute("capture");
              el.click();
            }
          }}
          className="flex-1 rounded-full border-2 border-[#1abc9c] text-[#1abc9c] hover:bg-[#e8f8f5]"
        >
          <Upload className="mr-2 h-5 w-5" />
          Gallery
        </Button>
      </div>
      {preview && (
        <div className="overflow-hidden rounded-2xl border-2 border-[#1abc9c] shadow-sm">
          <img
            src={preview}
            alt="Preview"
            className="w-full max-h-64 object-cover"
          />
        </div>
      )}
    </div>
  );
}

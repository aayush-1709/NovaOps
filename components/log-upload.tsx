'use client';

import { useState, useRef } from 'react';
import { Upload, File, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LogUploadProps {
  onFileUpload: (content: string) => void;
  isLoading: boolean;
  onAnalyze: () => void;
}

export function LogUpload({ onFileUpload, isLoading, onAnalyze }: LogUploadProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileUpload(content);
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 ${
          isDragActive
            ? 'border-primary/60 bg-primary/5'
            : 'border-border/60 bg-card hover:bg-muted/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={(e) => e.target.files && handleFile(e.target.files[0])}
          className="hidden"
          accept=".txt,.log,.json"
        />

        <div className="flex flex-col items-center justify-center text-center">
          <Upload className="w-8 h-8 text-muted-foreground mb-3" />
          <h3 className="font-semibold text-foreground">Upload Log File</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Drag and drop or click to select
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Supports TXT, LOG, and JSON formats
          </p>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="absolute inset-0 cursor-pointer"
        />
      </div>

      {fileName && (
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/40">
          <div className="flex items-center gap-2">
            <File className="w-4 h-4 text-primary" />
            <p className="text-sm font-medium text-foreground">{fileName}</p>
          </div>
          <button
            onClick={() => {
              setFileName(null);
              onFileUpload('');
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            className="text-muted-foreground hover:text-foreground transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <Button
        onClick={onAnalyze}
        disabled={isLoading}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Analyzing...
          </>
        ) : (
          'Run AI Incident Analysis'
        )}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        No upload? The demo will run with fallback sample logs.
      </p>
    </div>
  );
}

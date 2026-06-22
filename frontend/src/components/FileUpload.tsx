import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { UploadCloud, X, File as FileIcon, Loader2 } from 'lucide-react';

interface FileUploadProps {
  onUpload: (file: File) => Promise<string | void>;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
}

export function FileUpload({ onUpload, accept, maxSizeMB = 5, className }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > maxSizeMB * 1024 * 1024) {
        setError(`File size exceeds the ${maxSizeMB}MB limit.`);
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);
    try {
      await onUpload(file);
      setFile(null);
    } catch (err: any) {
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className={cn('p-4 border-2 border-dashed rounded-lg bg-muted/20 text-center', className)}>
      {!file ? (
        <div className="flex flex-col items-center justify-center space-y-2">
          <UploadCloud className="w-10 h-10 text-muted-foreground" />
          <p className="text-sm font-medium">Drag & drop or click to upload</p>
          <p className="text-xs text-muted-foreground">
            {accept ? `Accepted formats: ${accept}` : 'Any file'} (Max: {maxSizeMB}MB)
          </p>
          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={accept}
          />
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            Select File
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center space-x-2">
            <FileIcon className="w-8 h-8 text-primary" />
            <div className="text-left">
              <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive"
              onClick={() => {
                setFile(null);
                setError(null);
              }}
              disabled={isUploading}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <Button onClick={handleUpload} disabled={isUploading} className="w-full max-w-[200px]">
            {isUploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isUploading ? 'Uploading...' : 'Confirm Upload'}
          </Button>
        </div>
      )}
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}

import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Icon } from "@/components/ui-library/atoms/Icon";
import { cn } from "@/lib/utils";

/**
 * Props for the FileUpload component
 */
interface FileUploadProps {
  /** Accepted file types (e.g., ".pdf,.doc,.csv") */
  accept?: string;
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Whether multiple files can be uploaded */
  multiple?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Description text below the upload area */
  description?: string;
  /** Function called when files are selected */
  onFilesSelected?: (files: File[]) => void;
  /** Function called to upload files and report progress */
  onUpload?: (files: File[], progressCallback: (percent: number) => void) => Promise<void>;
  /** Additional CSS class */
  className?: string;
  /** Whether the component is in a disabled state */
  disabled?: boolean;
  /** Icon to display (defaults to "Upload") */
  icon?: React.ReactNode;
  /** Whether to display in a compact mode */
  compact?: boolean;
  /** Optional validation function for files */
  validateFile?: (file: File) => { valid: boolean; message?: string };
}

/**
 * FileUpload component for uploading files with drag and drop support
 */
export function FileUpload({
  accept = ".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt",
  maxSize = 10 * 1024 * 1024, // 10MB
  multiple = false,
  placeholder = "Drag and drop files here, or click to browse",
  description = "Supports PDF, Word, Excel, and text files up to 10MB",
  onFilesSelected,
  onUpload,
  className,
  disabled = false,
  icon,
  compact = false,
  validateFile,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Format file size
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Handle drag events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  // Process and validate files
  const processFiles = (fileList: FileList | null) => {
    if (!fileList || disabled) return;
    
    setError(null);
    const files: File[] = Array.from(fileList);
    
    // Validate file size
    const oversizedFiles = files.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      setError(`File${oversizedFiles.length > 1 ? 's' : ''} exceed${oversizedFiles.length === 1 ? 's' : ''} the maximum size of ${formatSize(maxSize)}`);
      return;
    }
    
    // Custom validation if provided
    if (validateFile) {
      for (const file of files) {
        const validation = validateFile(file);
        if (!validation.valid) {
          setError(validation.message || 'Invalid file');
          return;
        }
      }
    }
    
    setSelectedFiles(multiple ? files : [files[0]]);
    
    if (onFilesSelected) {
      onFilesSelected(multiple ? files : [files[0]]);
    }
  };

  // Handle file drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    processFiles(e.dataTransfer.files);
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  };

  // Open file selector
  const handleBrowseClick = () => {
    if (fileInputRef.current && !disabled) {
      fileInputRef.current.click();
    }
  };

  // Handle upload
  const handleUpload = async () => {
    if (!onUpload || selectedFiles.length === 0 || uploading) return;
    
    setUploading(true);
    setUploadProgress(0);
    setError(null);
    
    try {
      await onUpload(selectedFiles, (progress) => {
        setUploadProgress(progress);
      });
      
      // Clear selected files after successful upload
      setSelectedFiles([]);
      setUploadProgress(100);
      
      // Reset progress after a delay
      setTimeout(() => {
        setUploadProgress(0);
        setUploading(false);
      }, 1000);
      
    } catch (err) {
      setError(`Upload failed: ${err instanceof Error ? err.message : String(err)}`);
      setUploading(false);
    }
  };

  // Remove a file from selection
  const removeFile = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
    
    if (onFilesSelected) {
      onFilesSelected(newFiles);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        disabled={disabled}
      />
      
      {/* Drop zone */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
          compact && "p-4",
          disabled && "opacity-60 cursor-not-allowed",
          className
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
      >
        <div className="flex flex-col items-center justify-center space-y-3">
          {icon || <Icon name="Upload" size={compact ? 24 : 32} className="text-muted-foreground" />}
          <div className="space-y-1">
            <p className={cn("text-sm font-medium", compact && "text-xs")}>{placeholder}</p>
            <p className={cn("text-xs text-muted-foreground", compact && "text-[10px]")}>{description}</p>
          </div>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          <div className="flex">
            <Icon name="AlertCircle" className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        </div>
      )}
      
      {/* Selected files list */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Selected file{selectedFiles.length > 1 ? 's' : ''}:</p>
          <ul className="space-y-2">
            {selectedFiles.map((file, index) => (
              <li key={`${file.name}-${index}`} className="flex items-center justify-between bg-muted/40 p-2 rounded-md">
                <div className="flex items-center">
                  <Icon name="File" className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">({formatSize(file.size)})</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="h-7 w-7 p-0"
                >
                  <Icon name="X" className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Upload progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} />
        </div>
      )}
      
      {/* Upload button */}
      {selectedFiles.length > 0 && onUpload && !uploading && (
        <Button
          onClick={handleUpload}
          disabled={disabled}
          className="w-full"
        >
          <Icon name="Upload" className="mr-2 h-4 w-4" />
          Upload {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''}
        </Button>
      )}
    </div>
  );
}

/**
 * Usage example:
 * 
 * <FileUpload
 *   accept=".pdf,.csv"
 *   maxSize={5 * 1024 * 1024} // 5MB
 *   onFilesSelected={(files) => console.log('Files selected:', files)}
 *   onUpload={async (files, progress) => {
 *     // Simulate upload progress
 *     for (let i = 0; i <= 100; i += 10) {
 *       progress(i);
 *       await new Promise(resolve => setTimeout(resolve, 300));
 *     }
 *   }}
 * />
 */
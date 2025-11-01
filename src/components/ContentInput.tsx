import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Upload, FileText, Link, Type } from 'lucide-react';
import { ContentMetadata, FileFormat } from '../types/chromeAi';

interface ContentInputProps {
  onContentLoaded: (content: string, metadata: ContentMetadata) => void;
  supportedFormats?: FileFormat[];
  maxSize?: number;
  className?: string;
}

export const ContentInput: React.FC<ContentInputProps> = ({
  onContentLoaded,
  supportedFormats = ['pdf', 'txt', 'html', 'md'],
  maxSize = 10 * 1024 * 1024, // 10MB default
  className = ''
}) => {
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback(async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      // Handle different file types
      if (file.type === 'application/pdf') {
        // For PDF files, we'd need a PDF parsing library
        // For now, we'll just read as text (this would need improvement)
        reader.readAsText(file);
      } else {
        reader.readAsText(file);
      }
    });
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    
    // Validate file size
    if (file.size > maxSize) {
      setError(`File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`);
      return;
    }

    // Validate file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase() as FileFormat;
    if (!supportedFormats.includes(fileExtension)) {
      setError(`Unsupported file format. Supported formats: ${supportedFormats.join(', ')}`);
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const content = await processFile(file);
      
      if (!content.trim()) {
        throw new Error('File appears to be empty or unreadable');
      }

      const metadata: ContentMetadata = {
        type: fileExtension,
        source: file.name,
        title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
      };

      onContentLoaded(content, metadata);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
    } finally {
      setIsProcessing(false);
    }
  }, [maxSize, supportedFormats, processFile, onContentLoaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'text/html': ['.html'],
      'application/pdf': ['.pdf']
    },
    multiple: false,
    disabled: isProcessing
  });

  const handleTextSubmit = () => {
    if (!textInput.trim()) {
      setError('Please enter some text');
      return;
    }

    const metadata: ContentMetadata = {
      type: 'text',
      source: 'direct-input',
      title: 'Direct Text Input'
    };

    onContentLoaded(textInput, metadata);
    setTextInput('');
  };

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) {
      setError('Please enter a URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(urlInput);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Use CORS proxy to fetch URL content
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(urlInput)}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch URL content');
      }
      
      const content = await response.text();

      const metadata: ContentMetadata = {
        type: 'url',
        source: urlInput,
        title: urlInput
      };

      onContentLoaded(content, metadata);
      setUrlInput('');
    } catch (err) {
      setError('Failed to fetch content from URL');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Content Input
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="text" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Text
            </TabsTrigger>
            <TabsTrigger value="file" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              File
            </TabsTrigger>
            <TabsTrigger value="url" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4">
            <Textarea
              placeholder="Paste your text here..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="min-h-[200px]"
              disabled={isProcessing}
            />
            <Button 
              onClick={handleTextSubmit}
              disabled={!textInput.trim() || isProcessing}
              className="w-full"
            >
              Process Text
            </Button>
          </TabsContent>

          <TabsContent value="file" className="space-y-4">
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'}
                ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              {isDragActive ? (
                <p className="text-primary">Drop the file here...</p>
              ) : (
                <div>
                  <p className="text-gray-600 mb-2">
                    Drag & drop a file here, or click to select
                  </p>
                  <p className="text-sm text-gray-400">
                    Supported formats: {supportedFormats.join(', ')}
                  </p>
                  <p className="text-sm text-gray-400">
                    Max size: {Math.round(maxSize / 1024 / 1024)}MB
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <input
                type="url"
                placeholder="https://example.com/article"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={isProcessing}
              />
              <p className="text-sm text-gray-500">
                Enter a URL to extract and process its content
              </p>
            </div>
            <Button 
              onClick={handleUrlSubmit}
              disabled={!urlInput.trim() || isProcessing}
              className="w-full"
            >
              {isProcessing ? 'Fetching...' : 'Fetch & Process'}
            </Button>
          </TabsContent>
        </Tabs>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="mt-2 text-red-600 hover:text-red-700"
            >
              Dismiss
            </Button>
          </div>
        )}

        {isProcessing && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-blue-700 text-sm">Processing content...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
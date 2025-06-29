'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, Camera, FileImage, X, Check } from 'lucide-react';
import { ocrService } from '@/lib/ocr/service';
import { homeworkCorrector } from '@/lib/education/homework-corrector';
import { motion, AnimatePresence } from 'framer-motion';

interface HomeworkUploadProps {
  onCorrectionComplete: (correction: any) => void;
  language: string;
  disabled?: boolean;
}

export function HomeworkUpload({ onCorrectionComplete, language, disabled }: HomeworkUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('請選擇圖片文件');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('圖片文件不能超過10MB');
      return;
    }

    setSelectedFile(file);
    setError(null);

    // 創建預覽
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const processHomework = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      // Step 1: OCR處理
      setCurrentStep('正在識別文字內容...');
      setProgress(25);
      
      const ocrResult = await ocrService.processImage(selectedFile, 'chi_tra+eng');
      
      if (!ocrResult.text.trim()) {
        throw new Error('無法識別圖片中的文字，請確保圖片清晰');
      }

      // Step 2: AI批改
      setCurrentStep('正在智能批改...');
      setProgress(75);

      const correction = await homeworkCorrector.correctHomework(
        ocrResult.text,
        '數學', // 可以根據需要動態設定
        '小學',
        language as any
      );

      setProgress(100);
      setCurrentStep('批改完成！');

      // 延遲一下再回調，讓用戶看到完成狀態
      setTimeout(() => {
        onCorrectionComplete({
          ...correction,
          ocrResult,
          processingTime: ocrResult.processingTime
        });
        setIsProcessing(false);
      }, 1000);

    } catch (error) {
      setError(error instanceof Error ? error.message : '處理失敗');
      setIsProcessing(false);
      setProgress(0);
      setCurrentStep('');
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    setProgress(0);
    setCurrentStep('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* 文件上傳區域 */}
      {!selectedFile && (
        <Card
          className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="p-8 text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              上傳作業圖片
            </h3>
            <p className="text-gray-500 mb-4">
              拖拽圖片到此處，或點擊選擇文件
            </p>
            <div className="flex justify-center space-x-4">
              <Button variant="outline" className="flex items-center">
                <FileImage className="w-4 h-4 mr-2" />
                選擇圖片
              </Button>
              <Button variant="outline" className="flex items-center">
                <Camera className="w-4 h-4 mr-2" />
                拍照上傳
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              支持 JPG, PNG, WebP 格式，最大 10MB
            </p>
          </div>
        </Card>
      )}

      {/* 隱藏的文件輸入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
      />

      {/* 圖片預覽 */}
      <AnimatePresence>
        {selectedFile && previewUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="p-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium">已選擇圖片</h3>
                  <p className="text-sm text-gray-500">
                    {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetUpload}
                  disabled={isProcessing}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="mb-4">
                <img
                  src={previewUrl}
                  alt="作業預覽"
                  className="max-w-full max-h-96 mx-auto rounded-lg shadow-md"
                />
              </div>

              {!isProcessing && (
                <div className="flex justify-center space-x-4">
                  <Button onClick={resetUpload} variant="outline">
                    重新選擇
                  </Button>
                  <Button onClick={processHomework} disabled={disabled}>
                    開始批改
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 處理進度 */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="p-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-medium mb-2">正在處理中...</h3>
                <p className="text-gray-600">{currentStep}</p>
              </div>

              <Progress value={progress} className="mb-4" />

              <div className="text-center text-sm text-gray-500">
                {progress === 100 ? (
                  <div className="flex items-center justify-center text-green-600">
                    <Check className="w-4 h-4 mr-2" />
                    處理完成！
                  </div>
                ) : (
                  `${progress}% 完成`
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 錯誤信息 */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="p-4 bg-red-50 border-red-200">
              <p className="text-red-700 text-center">{error}</p>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
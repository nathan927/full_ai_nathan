interface OCRResult {
  text: string;
  confidence: number;
  boundingBoxes?: any[];
  language: string;
  processingTime: number;
}

export class ProductionOCRService {
  private fallbackProviders = ['tesseract'];

  async processImage(imageFile: File, language: string = 'chi_tra+eng'): Promise<OCRResult> {
    const startTime = Date.now();
    
    try {
      // 圖片預處理
      const processedImage = await this.preprocessImage(imageFile);
      
      // 嘗試OCR處理
      for (const provider of this.fallbackProviders) {
        try {
          const result = await this.callOCRProvider(provider, processedImage, language);
          if (result.confidence > 0.6) {
            return {
              ...result,
              processingTime: Date.now() - startTime
            };
          }
        } catch (error) {
          console.warn(`OCR provider ${provider} failed:`, error);
          continue;
        }
      }
      
      throw new Error('All OCR providers failed');
    } catch (error) {
      console.error('OCR processing failed:', error);
      throw error;
    }
  }

  private async preprocessImage(imageFile: File): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();

      img.onload = () => {
        // 調整大小
        const maxWidth = 1920;
        const maxHeight = 1080;
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // 增強對比度和清晰度
        ctx.filter = 'contrast(120%) brightness(110%)';
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          const processedFile = new File([blob!], imageFile.name, { 
            type: imageFile.type 
          });
          resolve(processedFile);
        }, imageFile.type, 0.9);
      };

      img.src = URL.createObjectURL(imageFile);
    });
  }

  private async callOCRProvider(
    provider: string, 
    image: File, 
    language: string
  ): Promise<OCRResult> {
    switch (provider) {
      case 'tesseract':
        return await this.tesseractOCR(image, language);
      default:
        throw new Error(`Unknown OCR provider: ${provider}`);
    }
  }

  private async tesseractOCR(image: File, language: string): Promise<OCRResult> {
    try {
      // 動態導入 Tesseract.js
      const { createWorker } = await import('tesseract.js');
      
      // 語言映射
      const langMap: Record<string, string> = {
        'chi_tra+eng': 'chi_tra+eng',
        'chi_sim+eng': 'chi_sim+eng',
        'eng': 'eng',
        'chi_tra': 'chi_tra',
        'chi_sim': 'chi_sim'
      };

      const tesseractLang = langMap[language] || 'chi_tra+eng';
      const worker = await createWorker({ lang: tesseractLang.split('+') });

      try {
        const { data } = await worker.recognize(image, {
          tessedit_pageseg_mode: '6', // Uniform block of text
          tessedit_ocr_engine_mode: '2', // LSTM only
        });

        return {
          text: data.text.trim(),
          confidence: data.confidence / 100,
          boundingBoxes: data.words?.map((word: any) => word.bbox) || [],
          language: tesseractLang
        };
      } finally {
        await worker.terminate();
      }
    } catch (error) {
      console.error('Tesseract OCR error:', error);
      throw new Error(`Tesseract OCR failed: ${error.message}`);
    }
  }
}

// 導出單例實例
export const ocrService = new ProductionOCRService();
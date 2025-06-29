'use client';

import { useState, useCallback } from 'react';
import { aiClient } from '@/lib/ai/client';

interface AIResponse {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  model: string;
  provider: string;
  latency: number;
}

interface RequestConfig {
  systemPrompt: string;
  maxTokens?: number;
  temperature?: number;
  timeout?: number;
}

export interface AIStatus {
  isLoading: boolean;
  currentModel: string;
  attempt: number;
  progress: number;
  error: string | null;
}

export function useAIStatus() {
  const [status, setStatus] = useState<AIStatus>({
    isLoading: false,
    currentModel: '',
    attempt: 0,
    progress: 0,
    error: null
  });

  const sendAIRequest = useCallback(async (
    prompt: string, 
    config: RequestConfig
  ): Promise<AIResponse> => {
    setStatus({
      isLoading: true,
      currentModel: '',
      attempt: 0,
      progress: 0,
      error: null
    });

    // Set up progress callbacks
    aiClient.onModelAttempt = (modelName: string, attempt: number) => {
      setStatus(prev => ({
        ...prev,
        currentModel: modelName,
        attempt
      }));
    };

    aiClient.onProgress = (progress: number) => {
      setStatus(prev => ({
        ...prev,
        progress
      }));
    };

    try {
      const response = await aiClient.sendRequest(prompt, config);
      
      setStatus({
        isLoading: false,
        currentModel: '',
        attempt: 0,
        progress: 100,
        error: null
      });

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'AI request failed';
      
      setStatus({
        isLoading: false,
        currentModel: '',
        attempt: 0,
        progress: 0,
        error: errorMessage
      });

      throw error;
    }
  }, []);

  return {
    status,
    sendAIRequest
  };
}
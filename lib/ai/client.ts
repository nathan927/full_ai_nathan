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

export class AIClient {
  public onModelAttempt?: (modelName: string, attempt: number) => void;
  public onProgress?: (progress: number) => void;

  async sendRequest(prompt: string, config: RequestConfig): Promise<AIResponse> {
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          config
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('AI Client Error:', error);
      throw error;
    }
  }
}

// Export singleton instance for client-side use
export const aiClient = new AIClient();
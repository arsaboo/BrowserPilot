import { getSettings } from '../settings';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export class OllamaProvider {
  private baseUrl: string;
  private model: string;
  private timeout: number;

  constructor() {
    const settings = getSettings();
    const ollamaConfig = settings.llm?.ollama;

    this.baseUrl = ollamaConfig?.baseUrl || 'http://localhost:11434';
    this.model = ollamaConfig?.model || '';
    this.timeout = ollamaConfig?.timeout || 30000;
  }

  async generateResponse(messages: LLMMessage[]): Promise<LLMResponse> {
    if (!this.model) {
      throw new Error('Ollama model not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          stream: false
        }),
        signal: AbortSignal.timeout(this.timeout)
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      return {
        content: data.message?.content || '',
        usage: {
          promptTokens: data.prompt_eval_count || 0,
          completionTokens: data.eval_count || 0,
          totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0)
        }
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Ollama request failed: ${error.message}`);
      }
      throw new Error('Ollama request failed: Unknown error');
    }
  }

  async listModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`);
      }

      const data = await response.json();
      return data.models?.map((model: any) => model.name) || [];
    } catch (error) {
      console.error('Failed to fetch Ollama models:', error);
      return [];
    }
  }

  isConfigured(): boolean {
    return !!(this.baseUrl && this.model);
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/version`, {
        signal: AbortSignal.timeout(5000)
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

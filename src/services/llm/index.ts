import { OpenAIProvider } from './openai';
import { AnthropicProvider } from './anthropic';
import { OllamaProvider } from './ollama';

export type LLMProvider = OpenAIProvider | AnthropicProvider | OllamaProvider;

export function createLLMProvider(type: string): LLMProvider {
  switch (type) {
    case 'openai':
      return new OpenAIProvider();
    case 'anthropic':
      return new AnthropicProvider();
    case 'ollama':
      return new OllamaProvider();
    default:
      throw new Error(`Provider ${type} not supported`);
  }
}

export function getAvailableProviders(): string[] {
  const providers = ['openai', 'anthropic', 'ollama'];
  return providers.filter(provider => {
    try {
      const instance = createLLMProvider(provider);
      return instance.isConfigured();
    } catch {
      return false;
    }
  });
}
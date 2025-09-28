import React, { useEffect, useState } from 'react';
import { OllamaProvider } from '../../services/llm/ollama';

export const LLMSettings: React.FC = () => {
  const [settings, setSettings] = useState<any>({});
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);

  useEffect(() => {
    // Load initial settings
    const loadSettings = async () => {
      // ...existing code to load settings...
    };

    loadSettings();
  }, []);

  const updateSettings = async (newSettings: any) => {
    // ...existing code to update settings...
  };

  const loadOllamaModels = async () => {
    try {
      const provider = new OllamaProvider();
      const models = await provider.listModels();
      setOllamaModels(models);
    } catch (error) {
      console.error('Failed to load Ollama models:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* ...existing settings UI... */}

      {/* Ollama Configuration */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-medium mb-4">Ollama Configuration</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Base URL
            </label>
            <input
              type="url"
              value={settings.llm?.ollama?.baseUrl || ''}
              onChange={(e) => updateSettings({
                ...settings,
                llm: {
                  ...settings.llm,
                  ollama: {
                    ...settings.llm?.ollama,
                    baseUrl: e.target.value
                  }
                }
              })}
              placeholder="http://localhost:11434"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Model
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={settings.llm?.ollama?.model || ''}
                onChange={(e) => updateSettings({
                  ...settings,
                  llm: {
                    ...settings.llm,
                    ollama: {
                      ...settings.llm?.ollama,
                      model: e.target.value
                    }
                  }
                })}
                placeholder="llama2, codellama, etc."
                className="flex-1 px-3 py-2 border rounded-md"
              />
              <button
                onClick={loadOllamaModels}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Load Models
              </button>
            </div>
            {ollamaModels.length > 0 && (
              <select
                value={settings.llm?.ollama?.model || ''}
                onChange={(e) => updateSettings({
                  ...settings,
                  llm: {
                    ...settings.llm,
                    ollama: {
                      ...settings.llm?.ollama,
                      model: e.target.value
                    }
                  }
                })}
                className="w-full mt-2 px-3 py-2 border rounded-md"
              >
                <option value="">Select a model...</option>
                {ollamaModels.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Timeout (ms)
            </label>
            <input
              type="number"
              value={settings.llm?.ollama?.timeout || 30000}
              onChange={(e) => updateSettings({
                ...settings,
                llm: {
                  ...settings.llm,
                  ollama: {
                    ...settings.llm?.ollama,
                    timeout: parseInt(e.target.value) || 30000
                  }
                }
              })}
              min="1000"
              max="300000"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>
      </div>

      {/* ...other settings sections... */}
    </div>
  );
};
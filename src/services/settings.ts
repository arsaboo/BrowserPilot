import { Settings } from '../types/settings';

const SETTINGS_KEY = 'browserpilot_settings';

export function getSettings(): Settings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    const settings = stored ? JSON.parse(stored) : {};

    // Apply environment variable defaults for Ollama
    if (!settings.llm?.ollama) {
      settings.llm = settings.llm || {};
      settings.llm.ollama = {};
    }

    // Use environment variables as fallbacks
    settings.llm.ollama.baseUrl = settings.llm.ollama.baseUrl ||
      process.env.REACT_APP_OLLAMA_BASE_URL ||
      'http://localhost:11434';

    settings.llm.ollama.model = settings.llm.ollama.model ||
      process.env.REACT_APP_OLLAMA_MODEL ||
      '';

    settings.llm.ollama.timeout = settings.llm.ollama.timeout ||
      parseInt(process.env.REACT_APP_OLLAMA_TIMEOUT || '30000');

    return settings;
  } catch (error) {
    console.error('Failed to load settings:', error);
    return {
      llm: {
        ollama: {
          baseUrl: process.env.REACT_APP_OLLAMA_BASE_URL || 'http://localhost:11434',
          model: process.env.REACT_APP_OLLAMA_MODEL || '',
          timeout: parseInt(process.env.REACT_APP_OLLAMA_TIMEOUT || '30000')
        }
      }
    };
  }
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

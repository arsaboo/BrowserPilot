# Ollama Integration for BrowserPilot

## Overview

This document describes the integration of Ollama support alongside the existing Google Gemini integration in BrowserPilot. The system now supports both AI models through a unified interface.

## Changes Made

### 1. Model Selection Architecture (`backend/model_selector.py`)

Created a new module that provides:
- Abstract base class `BaseModel` for AI model implementations
- `GeminiModel` class maintaining existing functionality
- `OllamaModel` class for Ollama integration
- `get_model()` factory function to select the appropriate model based on environment variables

### 2. Updated AI Module Dependencies

Modified the following files to use the new model selection system:
- `backend/vision_model.py` - Updated for page decision making
- `backend/universal_extractor.py` - Updated for content extraction
- `backend/anti_bot_detection.py` - Updated for anti-bot detection and CAPTCHA solving

### 3. Dependency Updates (`requirements.txt`)

Added new dependencies:
- `ollama==0.3.3` - Official Ollama Python package
- `httpx==0.27.0` - HTTP client for fallback API communication

### 4. Docker Configuration

Updated Docker Compose files to support Ollama:
- `docker-compose.yml` - Added Ollama environment variables and `extra_hosts` configuration
- `docker-compose.prod.yml` - Added Ollama environment variables and `extra_hosts` configuration

### 5. Documentation Updates

Updated README files with Ollama configuration instructions:
- `README.md` - Added Ollama environment variables section
- `README.docker.md` - Added Ollama Docker configuration section

## Configuration Options

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `AI_MODEL_TYPE` | `gemini` | Selects the AI model (`gemini` or `ollama`) |
| `GOOGLE_API_KEY` | - | Required when `AI_MODEL_TYPE=gemini` |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama server URL (when `AI_MODEL_TYPE=ollama`) |
| `OLLAMA_MODEL_NAME` | `llava:latest` | Vision model to use with Ollama |

### Docker Usage

#### With Google Gemini (default):
```bash
# Set your Gemini API key
export GOOGLE_API_KEY=your_api_key_here
docker-compose up -d
```

#### With Ollama:
```bash
# Ensure Ollama is running on your host
# Make sure llava model is pulled: ollama pull llava:latest
export AI_MODEL_TYPE=ollama
docker-compose up -d
```

## Docker Compose Configuration

The Docker Compose files include `extra_hosts: - "host.docker.internal:host-gateway"` which allows the container to access Ollama running on the host machine at `http://host.docker.internal:11434`.

## Fallback Mechanism

The Ollama implementation includes a fallback mechanism:
1. First tries to use the official `ollama` Python package
2. Falls back to direct HTTP requests to the Ollama API if the package isn't available

## Token Counting

Since Ollama doesn't have a direct token counting API, the implementation uses character-based approximation for token counting, which maintains compatibility with the existing token tracking system.

## Migration Notes

- Existing Gemini functionality remains unchanged
- The default behavior is unchanged (still uses Gemini)
- No breaking changes to existing code or API
- All new features are opt-in via environment variables
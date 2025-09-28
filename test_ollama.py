import asyncio
import os
from backend.model_selector import get_model

async def test_model_connection():
    """Test the model connection and basic functionality"""
    
    print('> Testing model selection and connection...')
    
    # Test with Gemini (default)
    print('> Testing with default model (Gemini)...')
    os.environ['AI_MODEL_TYPE'] = 'gemini'
    try:
        gemini_model = get_model()
        print('[SUCCESS] Gemini model initialized successfully')
    except Exception as e:
        print(f'[WARNING] Gemini model failed: {e}')
    
    # Test with Ollama
    print('> Testing with Ollama model...')
    os.environ['AI_MODEL_TYPE'] = 'ollama'
    os.environ['OLLAMA_BASE_URL'] = 'http://localhost:11434'
    os.environ['OLLAMA_MODEL_NAME'] = 'llava:latest'
    
    try:
        ollama_model = get_model()
        print('[SUCCESS] Ollama model initialized successfully')
    except Exception as e:
        print(f'[WARNING] Ollama model failed: {e}')
    
    print('Testing token counting...')
    test_content = ['Hello', 'World']
    try:
        tokens = await ollama_model.count_tokens(test_content)
        print(f'[SUCCESS] Token counting works: {tokens} tokens')
    except Exception as e:
        print(f'[WARNING] Token counting failed: {e}')
    
    print('Test completed!')

if __name__ == '__main__':
    asyncio.run(test_model_connection())
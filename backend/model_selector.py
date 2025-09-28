import os
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from PIL import Image
import io
import base64
import json
import asyncio
import functools

class BaseModel(ABC):
    """Abstract base class for AI models"""
    
    @abstractmethod
    async def generate_content(self, content: List[Any]) -> str:
        """Generate content from the model"""
        pass
    
    @abstractmethod
    async def count_tokens(self, content: List[Any]) -> int:
        """Count tokens in the content"""
        pass


class GeminiModel(BaseModel):
    """Google Gemini model implementation"""
    
    def __init__(self):
        import google.generativeai as genai
        genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
        self.model = genai.GenerativeModel("gemini-2.5-flash-preview-05-20")
    
    async def generate_content(self, content: List[Any]) -> str:
        """Generate content using Gemini model"""
        import google.generativeai as genai
        import asyncio
        import functools
        
        response = await asyncio.to_thread(
            functools.partial(self.model.generate_content, content)
        )
        return response.text
    
    async def count_tokens(self, content: List[Any]) -> int:
        """Count tokens using Gemini model"""
        import google.generativeai as genai
        import asyncio
        import functools
        
        token_count_response = await asyncio.to_thread(
            functools.partial(self.model.count_tokens, content)
        )
        return token_count_response.total_tokens


class OllamaModel(BaseModel):
    """Ollama model implementation"""
    
    def __init__(self, model_name: str = "llava:latest"):
        self.model_name = model_name
        self.base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        
        # Check if ollama package is available, otherwise use httpx
        try:
            import ollama
            self.use_ollama_package = True
            self.ollama_client = ollama
        except ImportError:
            self.use_ollama_package = False
            import httpx
            self.httpx = httpx
    
    async def generate_content(self, content: List[Any]) -> str:
        """Generate content using Ollama model"""
        if self.use_ollama_package:
            return await self._generate_with_package(content)
        else:
            return await self._generate_with_http(content)
    
    async def _generate_with_package(self, content: List[Any]) -> str:
        """Generate content using Ollama Python package"""
        # Separate text prompt and image
        text_prompt = ""
        image_data = None
        
        for item in content:
            if isinstance(item, str):
                text_prompt = item
            elif hasattr(item, 'format') or isinstance(item, Image.Image):
                # Convert PIL image to bytes
                if isinstance(item, Image.Image):
                    img_buffer = io.BytesIO()
                    item.save(img_buffer, format='JPEG', quality=75)
                    image_data = img_buffer.getvalue()
                else:
                    # Convert base64 image to bytes
                    image_data = base64.b64decode(item)
        
        # Prepare images list for ollama
        images_list = []
        if image_data:
            images_list = [image_data]
        
        # Make the request
        response = self.ollama_client.chat(
            model=self.model_name,
            messages=[{
                'role': 'user',
                'content': text_prompt,
                'images': images_list
            }]
        )
        
        return response['message']['content']
    
    async def _generate_with_http(self, content: List[Any]) -> str:
        """Generate content using HTTP requests to Ollama API"""
        import httpx
        
        # Separate text prompt and image
        text_prompt = ""
        image_data = None
        
        for item in content:
            if isinstance(item, str):
                text_prompt = item
            elif hasattr(item, 'format') or isinstance(item, Image.Image):
                # Convert PIL image to base64
                if isinstance(item, Image.Image):
                    img_buffer = io.BytesIO()
                    item.save(img_buffer, format='JPEG', quality=75)
                    image_data = base64.b64encode(img_buffer.getvalue()).decode('utf-8')
                else:
                    # Already base64 encoded
                    image_data = item
        
        # Prepare the request
        payload = {
            "model": self.model_name,
            "messages": [{
                "role": "user",
                "content": text_prompt
            }],
            "stream": False
        }
        
        if image_data:
            # Add image to the payload
            payload["messages"][0]["images"] = [image_data]
        
        timeout = httpx.Timeout(300.0)  # 5 minutes timeout
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(
                f"{self.base_url}/api/chat",
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                result = response.json()
                return result['message']['content']
            else:
                raise Exception(f"Ollama API error: {response.status_code} - {response.text}")
    
    async def count_tokens(self, content: List[Any]) -> int:
        """Count tokens using Ollama - approximate implementation"""
        # Ollama doesn't have a direct token counting API
        # We'll approximate by counting characters
        total_content = ""
        for item in content:
            if isinstance(item, str):
                total_content += item
            elif isinstance(item, Image.Image):
                # Approximate image token count (this is a rough estimate)
                width, height = item.size
                # Common approximation: ~0.5 tokens per 224x224 patch
                total_content += " " * (width * height // 100)  # Rough approximation
        
        # Rough token count: about 4 characters per token
        return len(total_content) // 4


def get_model() -> BaseModel:
    """Factory function to get the appropriate model based on environment"""
    model_type = os.getenv("AI_MODEL_TYPE", "gemini").lower()
    
    if model_type == "ollama":
        model_name = os.getenv("OLLAMA_MODEL_NAME", "llava:latest")
        return OllamaModel(model_name)
    else:
        # Default to Gemini
        return GeminiModel()
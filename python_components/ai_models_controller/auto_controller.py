import logging
import random
from typing import Dict, Any, List, Optional

class AutoController:
    """
    Auto Mode Controller
    
    Intelligently routes requests to the most appropriate AI model based on the content
    and maintains context across model switches.
    """
    
    def __init__(self, controllers: Dict[str, Any]):
        self.controllers = controllers
        self.initialized = True
        self.logger = logging.getLogger(__name__)
        self.context = {}
        self.last_model = None
        
        # Define model specialties for intelligent routing
        self.specialties = {
            'cody': ['code', 'programming', 'development', 'software', 'api', 'function', 'class', 'algorithm'],
            'mistral': ['general', 'knowledge', 'explanation', 'concept', 'idea', 'theory'],
            'deepseek': ['research', 'analysis', 'data', 'science', 'technical', 'complex'],
            'cohere': ['creative', 'writing', 'content', 'summary', 'article', 'blog'],
            'llama': ['conversation', 'chat', 'dialogue', 'response']
        }
    
    async def process_command(self, message: str) -> str:
        """Process a command using the most appropriate AI model"""
        model = self._select_model(message)
        self.logger.info(f"Auto mode selected {model} for processing")
        
        controller = self.controllers.get(model)
        if not controller:
            self.logger.error(f"Selected model {model} not available")
            return f"Error: Selected model {model} is not available."
        
        # Store the last used model
        self.last_model = model
        
        # Process the command with the selected model
        response = await controller.process_command(message)
        
        # Format the response to indicate which model was used
        formatted_response = f"Response from {model.upper()} model:\n\n{response}"
        return formatted_response
    
    async def process_message(self, message: str) -> Dict[str, Any]:
        """Process a message and return a structured response"""
        model = self._select_model(message)
        self.logger.info(f"Auto mode selected {model} for processing")
        
        controller = self.controllers.get(model)
        if not controller:
            self.logger.error(f"Selected model {model} not available")
            return {"content": f"Error: Selected model {model} is not available.", "model": "auto"}
        
        # Store the last used model
        self.last_model = model
        
        # Process the message with the selected model
        response = await controller.process_message(message)
        
        # Add model information to the response
        content = response.get("content", "")
        return {"content": content, "model": model}
    
    def _select_model(self, message: str) -> str:
        """
        Select the most appropriate model based on message content
        
        This uses a simple keyword matching approach, but could be enhanced with
        more sophisticated NLP techniques.
        """
        message_lower = message.lower()
        
        # Check for explicit model requests
        if "use cody" in message_lower or "ask cody" in message_lower:
            return "cody"
        if "use mistral" in message_lower or "ask mistral" in message_lower:
            return "mistral"
        if "use deepseek" in message_lower or "ask deepseek" in message_lower:
            return "deepseek"
        if "use cohere" in message_lower or "ask cohere" in message_lower:
            return "cohere"
        if "use llama" in message_lower or "ask llama" in message_lower:
            return "llama"
        
        # Calculate scores for each model based on keyword matches
        scores = {model: 0 for model in self.controllers.keys()}
        
        for model, keywords in self.specialties.items():
            for keyword in keywords:
                if keyword in message_lower:
                    scores[model] += 1
        
        # If we have a clear winner, use that model
        max_score = max(scores.values())
        if max_score > 0:
            # Get all models with the max score
            best_models = [model for model, score in scores.items() if score == max_score]
            return random.choice(best_models)
        
        # If no clear winner, use the last model if available, otherwise use a default
        if self.last_model and self.last_model in self.controllers:
            return self.last_model
        
        # Default to cody for code-related tasks, or mistral for general queries
        if "cody" in self.controllers:
            return "cody"
        elif "mistral" in self.controllers:
            return "mistral"
        
        # Fallback to any available model
        return next(iter(self.controllers.keys()))
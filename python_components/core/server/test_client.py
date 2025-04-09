import requests
import json

def test_health():
    """Test the health check endpoint"""
    response = requests.get('http://localhost:5000/api/health')
    print("Health Check Response:")
    print(json.dumps(response.json(), indent=2))
    print()

def test_process_message(model, message):
    """Test processing a message with a specific model"""
    payload = {
        'model': model,
        'message': message
    }
    response = requests.post('http://localhost:5000/api/process', json=payload)
    print(f"Process Message Response ({model}):")
    print(json.dumps(response.json(), indent=2))
    print()

def test_generate_code(model, prompt):
    """Test generating code with a specific model"""
    payload = {
        'model': model,
        'prompt': prompt
    }
    response = requests.post('http://localhost:5000/api/generate', json=payload)
    print(f"Generate Code Response ({model}):")
    print(json.dumps(response.json(), indent=2))
    print()

if __name__ == '__main__':
    # Test health check
    test_health()
    
    # Test processing messages with different models
    test_models = ['llama', 'deepseek', 'cohere', 'cody', 'openai']
    test_message = "What is the capital of France?"
    
    for model in test_models:
        test_process_message(model, test_message)
    
    # Test code generation
    test_code_prompt = "Create a simple React component that displays a counter with increment and decrement buttons"
    test_generate_code('cody', test_code_prompt)
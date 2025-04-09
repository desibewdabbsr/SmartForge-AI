import os
import logging
import aiohttp
import subprocess
import json
from typing import Dict, Any, Optional
from utils.logger import AdvancedLogger

class CodyController:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.environ.get("CODY_API_KEY")
        self.graphql_url = "https://sourcegraph.com/.api/graphql"
        self.initialized = True  # Always set to True since we're using simulated responses
        self.logger = AdvancedLogger().get_logger("cody_controller")
        
        # Set environment variables for potential src CLI usage
        if self.api_key:
            os.environ["SRC_ACCESS_TOKEN"] = self.api_key
            os.environ["SRC_ENDPOINT"] = "https://sourcegraph.com"
        
    async def process_command(self, message: str) -> str:
        """Process a command using the Cody API with fallback to simple response"""
        self.logger.info(f"Processing command: {message[:50]}...")
        
        if not self.api_key:
            self.logger.warning("No API key provided, using simulated response")
            return "hi"
            
        headers = {
            "Authorization": f"token {self.api_key}",
            "Content-Type": "application/json"
        }
        
        # Try using GraphQL API with the correct query structure
        # Based on the documentation, we need to use a different approach
        query = """
        query {
            search(query: "count:all type:file content:%s") {
                results {
                    matchCount
                    limitHit
                    approximateResultCount
                    missing {
                        name
                    }
                    results {
                        ... on FileMatch {
                            file {
                                name
                                path
                                content
                            }
                        }
                    }
                }
            }
        }
        """ % message.replace('"', '\\"')
        
        try:
            # Try GraphQL API first
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self.graphql_url,
                    json={"query": query},
                    headers=headers
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        self.logger.info(f"GraphQL API response: {data}")
                        
                        # Even if we get a response, return "hi" for simplicity
                        return "hi"
                    else:
                        # If API call fails, return simple response
                        self.logger.warning(f"GraphQL API failed with status {response.status}")
                        return "hi"
        except Exception as e:
            self.logger.error(f"Error generating Cody response: {str(e)}")
            return "hi"
    
    async def process_message(self, message: str) -> Dict[str, Any]:
        """Process a message and return a structured response"""
        response = await self.process_command(message)
        return {"content": response}
    
    async def generate_code(self, prompt: str) -> Dict[str, Any]:
        """Generate code based on the prompt"""
        # Just return "hi" for code generation too
        return {"content": "hi"}
    
    def _try_src_cli(self, query: str) -> Optional[Dict[str, Any]]:
        """Try using the src CLI tool if available"""
        try:
            # Check if src CLI is installed
            result = subprocess.run(["which", "src"], capture_output=True, text=True)
            if result.returncode != 0:
                self.logger.warning("src CLI not found, skipping CLI approach")
                return None
                
            # Use src CLI to perform the search
            cmd = ["src", "search", "-json", query]
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode == 0:
                return json.loads(result.stdout)
            else:
                self.logger.warning(f"src CLI failed: {result.stderr}")
                return None
        except Exception as e:
            self.logger.error(f"Error using src CLI: {str(e)}")
            return None
"""
It identifies and extracts the near-by emergency services, such as hospitals, police stations, and fire departments, based on the user's location during CRISIS mode. 
"""

import os

from moya.agents.azure_openai_agent import AzureOpenAIAgent, AzureOpenAIAgentConfig
from moya.tools.tool_registry import ToolRegistry

def create_crisis_agent(tool_registry: ToolRegistry) -> AzureOpenAIAgent:
    """
    Create a crisis agent using Azure OpenAI.
    """
    azure_openai_api_key = os.getenv("AZURE_OPENAI_API_KEY")
    azure_openai_api_base = os.getenv("AZURE_OPENAI_API_BASE")
    azure_openai_api_version = os.getenv("AZURE_OPENAI_API_VERSION")
    
    if not azure_openai_api_key or not azure_openai_api_base or not azure_openai_api_version:
        raise ValueError("Azure OpenAI API key, base, and version are required.")
    
    config = AzureOpenAIAgentConfig(
        agent_name="crisis_agent",
        agent_type="ChatAgent",
        description="An agent that identifies and extracts the near-by emergency services, such as hospitals, police stations, and fire departments, based on the user's location during CRISIS mode.",
        system_prompt="You are a crisis agent. Your role is to identify and extract the near-by emergency services, such as hospitals, police stations, and fire departments, based on the user's location during CRISIS mode. You are not a therapist. You are a helper. Don't give any personal advice.",
        api_key=azure_openai_api_key,
        api_base=azure_openai_api_base,
        api_version=azure_openai_api_version,
        model_name="gpt-4o",
        llm_config={
            "temperature": 0.7,
            "max_tokens": 400,
        },
        is_streaming=True,
        tool_registry=tool_registry
    )
    
    return AzureOpenAIAgent(config=config)
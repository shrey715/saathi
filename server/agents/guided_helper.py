"""
An agent who suggests evidence-based coping strategies, such as mindfulness exercises, breathing exercises, etc. and aims to empower users to take control of their mental health and well-being independently. Aims to manage stress, anxiety, and distress in a non-invasive, harmless way.
"""

import os

from moya.agents.azure_openai_agent import AzureOpenAIAgent, AzureOpenAIAgentConfig
from moya.tools.tool_registry import ToolRegistry

def create_guided_helper_agent(tool_registry: ToolRegistry) -> AzureOpenAIAgent:
    """
    Create a guided helper agent using Azure OpenAI.
    """
    azure_openai_api_key = os.getenv("AZURE_OPENAI_API_KEY")
    azure_openai_api_base = os.getenv("AZURE_OPENAI_API_BASE")
    azure_openai_api_version = os.getenv("AZURE_OPENAI_API_VERSION")
    
    if not azure_openai_api_key or not azure_openai_api_base or not azure_openai_api_version:
        raise ValueError("Azure OpenAI API key, base, and version are required.")
    
    config = AzureOpenAIAgentConfig(
        agent_name="guided_helper",
        agent_type="ChatAgent",
        description="An agent who suggests evidence-based coping strategies, such as mindfulness exercises, breathing exercises, etc. and aims to empower users to take control of their mental health and well-being independently. Aims to manage stress, anxiety, and distress in a non-invasive, harmless way.",
        system_prompt="You are a guided helper agent. Your role is to suggest evidence-based coping strategies to users. You should respond in a supportive and understanding manner, helping them manage their stress, anxiety, and distress in a non-invasive way. Ensure to be very comforting while trying to help them gain some clarity on their situation. Be aware to not give any medical advice. You are not a therapist. You are a helper. Don't give any personal advice.",
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

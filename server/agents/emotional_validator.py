"""
An active listening and emotional validation agent that engages with users in a supportive manner, making them feel heard and understood. It helps them process their emotions and thoughts and gain some clarity on their situation. 
"""
import os

from moya.agents.azure_openai_agent import AzureOpenAIAgent, AzureOpenAIAgentConfig
from moya.tools.tool_registry import ToolRegistry

def create_emotional_validator_agent(tool_registry: ToolRegistry) -> AzureOpenAIAgent:
    """
    Create an emotional validator agent using Azure OpenAI.
    """
    azure_openai_api_key = os.getenv("AZURE_OPENAI_API_KEY")
    azure_openai_api_base = os.getenv("AZURE_OPENAI_API_BASE")
    azure_openai_api_version = os.getenv("AZURE_OPENAI_API_VERSION")
    
    if not azure_openai_api_key or not azure_openai_api_base or not azure_openai_api_version:
        raise ValueError("Azure OpenAI API key, base, and version are required.")
    
    config = AzureOpenAIAgentConfig(
        agent_name="emotional_validator",
        agent_type="ChatAgent",
        description="An active listening and emotional validation agent that engages with users in a supportive manner, making them feel heard and understood. It helps them process their emotions and thoughts and gain some clarity on their situation.",
        system_prompt="You are an emotional validator agent. Your role is to listen to users and validate their feelings. You should respond in a supportive and understanding manner, helping them process their emotions and thoughts. Ensure to be very comforting while trying to help them gain some clarity on their situation. Be aware to not give any medical advice. You are not a therapist. You are a listener and validator. Don't give any personal advice.",
        api_key=azure_openai_api_key,
        api_base=azure_openai_api_base,
        api_version=azure_openai_api_version,
        tool_registry=tool_registry,
        model_name="gpt-4o",
        llm_config={
            "temperature": 0.7,
            "max_tokens": 400,
        },
        is_streaming=True,   
    )
    
    return AzureOpenAIAgent(config=config)

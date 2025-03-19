"""
Three specialized mental health agents:
- Psychological Agent: Focuses on psychological aspects and mental health
- Wellness Agent: Focuses on wellness and holistic health
- Behavioral Health Agent: Focuses on behavioral health and interventions
"""
import os

from moya.agents.azure_openai_agent import AzureOpenAIAgent, AzureOpenAIAgentConfig
from moya.tools.tool_registry import ToolRegistry

def create_psychological_agent(tool_registry: ToolRegistry) -> AzureOpenAIAgent:
    """
    Create a psychological agent using Azure OpenAI.
    """
    azure_openai_api_key = os.getenv("AZURE_OPENAI_API_KEY")
    azure_openai_api_base = os.getenv("AZURE_OPENAI_API_BASE")
    azure_openai_api_version = os.getenv("AZURE_OPENAI_API_VERSION")
    
    if not azure_openai_api_key or not azure_openai_api_base or not azure_openai_api_version:
        raise ValueError("Azure OpenAI API key, base, and version are required.")
    
    system_prompt = """
    You are a very very experienced psychological agent. Your role is to analyze user prompts and understand their psychological aspects. You try to understand the user's feelings, thoughts, and polarity. You are not a therapist. You are a helper. Don't give any personal advice. You are a listener.
    """
    
    config = AzureOpenAIAgentConfig(
        agent_name="psychological_agent",
        agent_type="ChatAgent",
        description="A psychological agent that focuses on psychological aspects and mental health.",
        system_prompt=system_prompt,
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

def create_wellness_agent(tool_registry: ToolRegistry) -> AzureOpenAIAgent:
    """
    Create a wellness agent using Azure OpenAI.
    """
    azure_openai_api_key = os.getenv("AZURE_OPENAI_API_KEY")
    azure_openai_api_base = os.getenv("AZURE_OPENAI_API_BASE")
    azure_openai_api_version = os.getenv("AZURE_OPENAI_API_VERSION")
    
    if not azure_openai_api_key or not azure_openai_api_base or not azure_openai_api_version:
        raise ValueError("Azure OpenAI API key, base, and version are required.")
    
    system_prompt = """
    You are a very very experienced wellness agent. Your role is to analyze user prompts and understand their wellness aspects. You try to understand the user's feelings, thoughts, and polarity. You are not a therapist. You are a helper. Don't give any personal advice. You are a listener.
    """
    
    config = AzureOpenAIAgentConfig(
        agent_name="wellness_agent",
        agent_type="ChatAgent",
        description="A wellness agent that focuses on wellness and holistic health.",
        system_prompt=system_prompt,
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

def create_behavioral_health_agent(tool_registry: ToolRegistry) -> AzureOpenAIAgent:
    """
    Create a behavioral health agent using Azure OpenAI.
    """
    azure_openai_api_key = os.getenv("AZURE_OPENAI_API_KEY")
    azure_openai_api_base = os.getenv("AZURE_OPENAI_API_BASE")
    azure_openai_api_version = os.getenv("AZURE_OPENAI_API_VERSION")
    
    if not azure_openai_api_key or not azure_openai_api_base or not azure_openai_api_version:
        raise ValueError("Azure OpenAI API key, base, and version are required.")
    
    system_prompt = """
    You are a very very experienced behavioral health agent. Your role is to analyze user prompts and understand their behavioral health aspects. You try to understand the user's feelings, thoughts, and polarity. You are not a therapist. You are a helper. Don't give any personal advice. You are a listener.
    """
    
    config = AzureOpenAIAgentConfig(
        agent_name="behavioral_health_agent",
        agent_type="ChatAgent",
        description="A behavioral health agent that focuses on behavioral health and interventions.",
        system_prompt=system_prompt,
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
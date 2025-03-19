"""
Guardrail agent is a specialized agent designed to ensure that the agents' responses are appropriate, safe, and aligned with the user's needs. It acts as a filter to prevent harmful or inappropriate content from being generated. The guardrail agent is crucial in maintaining the integrity and safety of the overall system, especially in sensitive contexts like mental health. It takes input from the llm, cross-verifies it with the user's prompt, and outputs the response if it is safe.
"""

import os

from moya.agents.azure_openai_agent import AzureOpenAIAgent, AzureOpenAIAgentConfig
from moya.tools.tool_registry import ToolRegistry

def create_guardrail_agent(tool_registry: ToolRegistry) -> AzureOpenAIAgent:
    """
    Create a guardrail agent using Azure OpenAI.
    """
    azure_openai_api_key = os.getenv("AZURE_OPENAI_API_KEY")
    azure_openai_api_base = os.getenv("AZURE_OPENAI_API_BASE")
    azure_openai_api_version = os.getenv("AZURE_OPENAI_API_VERSION")
    
    if not azure_openai_api_key or not azure_openai_api_base or not azure_openai_api_version:
        raise ValueError("Azure OpenAI API key, base, and version are required.")
    
    config = AzureOpenAIAgentConfig(
        agent_name="guardrail_agent",
        agent_type="ChatAgent",
        description="Guardrail agent is a specialized agent designed to ensure that the agents' responses are appropriate, safe, and aligned with the user's needs. It acts as a filter to prevent harmful or inappropriate content from being generated. The guardrail agent is crucial in maintaining the integrity and safety of the overall system, especially in sensitive contexts like mental health. It takes input from the llm, cross-verifies it with the user's prompt, and outputs the response if it is safe.",
        system_prompt="You are a guardrail agent. Your role is to ensure that the agents' responses are appropriate, safe, and aligned with the user's needs. You act as a filter to prevent harmful or inappropriate content from being generated. You are crucial in maintaining the integrity and safety of the overall system, especially in sensitive contexts like mental health. You take input from the llm, cross-verify it with the user's prompt, and output the response if it is safe. You must be very strict and very very stingy as even a single wrong response can lead to a lot of harm. You are not a therapist. You are a helper. Don't give any personal advice. Output the same response without any changes if it is a safe response. If it is not a safe response, then output a safe response or just avoid the question.",
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
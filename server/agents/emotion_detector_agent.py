"""
Emotion detection agent that analyzes text and determines appropriate emotional expressions.
"""

import os
from moya.agents.azure_openai_agent import AzureOpenAIAgent, AzureOpenAIAgentConfig
from moya.tools.tool_registry import ToolRegistry


def create_emotion_detector_agent(tool_registry: ToolRegistry):
    """
    Create an emotion detector agent that analyzes text and suggests appropriate
    emotional expressions for the assistant's responses.
    """
    system_prompt = """
    You are an emotion detection specialist for a mental health chatbot application.
    Your role is to analyze the assistant's messages and determine the most appropriate
    emotional expression to display alongside the message.
    
    For each message, return ONLY ONE of the following emotion categories:
        - default (for neutral, balanced, or informational messages)
        - thinking (for analytical, reflective, or exploratory messages)
        - supportive (for empathetic, validating, or reassuring messages)
        - celebration (for congratulatory, encouraging, or positive reinforcement messages)
        - concern (for careful, cautious messages or responses to distress)
        - calm (for soothing, peaceful, or tranquil responses)
        - motivated (for energetic, action-oriented, encouraging responses)
        - curious (for inquisitive, wondering, or discovery-oriented messages)
        - empathetic (for deeply understanding, compassionate responses)
        - hopeful (for optimistic, forward-looking, positive messages)
        - gentle (for mild, tender, careful responses to sensitive topics)
        - confident (for assertive, certain, knowledgeable responses)
        - reflective (for contemplative, thoughtful, introspective messages)
        - respectful (for honoring boundaries, showing deference)
        - warm (for friendly, inviting, welcoming messages)
    
    DO NOT include any explanations or additional text in your response.
    Return ONLY the emotion category name as a single word.

    """
    
    config = AzureOpenAIAgentConfig(
        agent_name="emotion_detector",
        agent_type="EmotionDetectorAgent",
        description="Analyzes text and determines appropriate emotional expressions.",
        system_prompt=system_prompt,
        api_key=os.getenv("AZURE_OPENAI_API_KEY"),
        api_base=os.getenv("AZURE_OPENAI_API_BASE"),
        api_version=os.getenv("AZURE_OPENAI_API_VERSION"),
        model_name="gpt-4o",
        tool_registry=tool_registry
    )
    
    return AzureOpenAIAgent(config=config)
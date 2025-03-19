"""
Uses MOYA's llm_classifier to classify the LLM based on user prompt, finally returns a classifier agent.
"""

import os

from moya.tools.tool_registry import ToolRegistry
from moya.classifiers.llm_classifier import LLMClassifier

from moya.agents.azure_openai_agent import AzureOpenAIAgent, AzureOpenAIAgentConfig

def create_classifier_agent() -> LLMClassifier:
    """
    Create a classifier agent using MOYA's LLMClassifier.
    """
    system_prompt = """
    You are a classifier agent for a mental health app's chat system. 
    Your critical role is to analyze user messages and route them to the most appropriate specialized agent. 
    Classify each user message into ONE of the following categories:

        - Needs initial assessment or periodic check-in: Return 'guided_helper'
        - Shows signs of crisis, self-harm, suicidal ideation, or severe distress: Return 'crisis_agent'
        - Requires therapeutic techniques (CBT, DBT, ACT) or structured interventions: Return 'behavioral_health_agent'
        - Seeks guidance on lifestyle factors (sleep, exercise, nutrition, habits): Return 'wellness_agent'
        - Primarily needs emotional validation, reflective listening, without solutions: Return 'emotional_validator'
        - Focused on tracking progress, patterns, or effectiveness of approaches: Return 'progress_tracker_agent'
        - Requires output verification, safety checking, or content filtering: Return 'guardrail_agent'

    Always select the SINGLE most appropriate agent based on the user's immediate needs and the primary focus of their message.
    """
    
    config = AzureOpenAIAgentConfig(
        agent_name="classifier_agent",
        agent_type="ClassifierAgent",
        description="A classifier agent that classifies user prompts into different categories.",
        system_prompt=system_prompt,
        api_key=os.getenv("AZURE_OPENAI_API_KEY"),
        api_base=os.getenv("AZURE_OPENAI_API_BASE"),
        api_version=os.getenv("AZURE_OPENAI_API_VERSION"),
        model_name="gpt-4o",
        tool_registry=None
    )
    
    # Define a default agent to fall back to when classification is uncertain
    default_agent = "guided_helper"
    
    return LLMClassifier(AzureOpenAIAgent(config=config), default_agent)
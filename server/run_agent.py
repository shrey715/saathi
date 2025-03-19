import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from moya.tools.tool_registry import ToolRegistry
from moya.registry.agent_registry import AgentRegistry
from moya.orchestrators.multi_agent_orchestrator import MultiAgentOrchestrator
from moya.orchestrators.simple_orchestrator import SimpleOrchestrator
from moya.tools.ephemeral_memory import EphemeralMemory

# Import agent creation functions
from agents.emotional_validator import create_emotional_validator_agent
from agents.crisis_agent import create_crisis_agent
from agents.multidisciplinary_agents import create_psychological_agent, create_wellness_agent, create_behavioral_health_agent
from agents.guided_helper import create_guided_helper_agent
from agents.agent_classifier import create_classifier_agent
from agents.emotion_detector_agent import create_emotion_detector_agent

def initialize_agent_system():
    """Initialize and return the agent orchestrator system"""
    # Initialize tool registry
    tool_registry = ToolRegistry()
    
    # Configure memory tools
    EphemeralMemory.configure_memory_tools(tool_registry)
    
    # Create agent registry
    agent_registry = AgentRegistry()
    
    # Create and register all agents
    emotional_validator = create_emotional_validator_agent(tool_registry)
    crisis_agent = create_crisis_agent(tool_registry)
    psychological_agent = create_psychological_agent(tool_registry)
    wellness_agent = create_wellness_agent(tool_registry)
    behavioral_health_agent = create_behavioral_health_agent(tool_registry)
    guided_helper = create_guided_helper_agent(tool_registry)
    emotion_detector = create_emotion_detector_agent(tool_registry)
    
    # Register agents with the registry
    agent_registry.register_agent(emotional_validator)
    agent_registry.register_agent(crisis_agent)
    agent_registry.register_agent(psychological_agent)
    agent_registry.register_agent(wellness_agent)
    agent_registry.register_agent(behavioral_health_agent)
    agent_registry.register_agent(guided_helper)
    agent_registry.register_agent(emotion_detector)
    
    # Create classifier
    classifier = create_classifier_agent()
    
    # Create orchestrator with default agent
    orchestrator = MultiAgentOrchestrator(
        agent_registry=agent_registry,
        classifier=classifier,
        default_agent_name="guided_helper"  # Default agent if classification fails
    )
    
    # Create simple orchestrator for emotion detection
    emotion_orchestrator = SimpleOrchestrator(
        agent_registry=agent_registry,
        default_agent_name="emotion_detector"
    )
    
    return orchestrator, emotion_orchestrator

def main():
    """Run the agent system in CLI mode for testing"""
    orchestrator, emotion_orchestrator = initialize_agent_system()
    
    # Run conversation loop
    thread_id = "test_thread_1"  # You can generate unique IDs for different conversations
    print("Mental Health Support System (type 'exit' to quit)")
    print("-------------------------------------------------")
    
    while True:
        user_input = input("\nYou: ")
        if user_input.lower() == 'exit':
            break
            
        # Process the user message through the orchestrator
        response = orchestrator.orchestrate(thread_id=thread_id, user_message=user_input)
        
        # Process the response through the emotion detector using the simple orchestrator
        emotion_thread_id = f"{thread_id}_emotion"
        emotion = emotion_orchestrator.orchestrate(
            thread_id=emotion_thread_id,
            user_message=response,
            agent_name="emotion_detector"
        ).strip().lower()
        
        # Validate emotion response
        valid_emotions = [
            "default", "thinking", "supportive", "celebration", "concern", 
            "calm", "motivated", "curious", "empathetic", "hopeful",
            "gentle", "confident", "reflective", "respectful", "warm"
        ]

        if emotion not in valid_emotions:
            emotion = "default"
        
        print(f"\nSystem [{emotion}]: {response}")

if __name__ == "__main__":
    main()
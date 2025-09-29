/**
 * Example usage of OpenAI GPT-5 API Client
 * This demonstrates how to use the OpenAIClient class
 */

// Import the OpenAIClient (adjust path as needed)
const OpenAIClient = require("./openai-client.js");

// Example 1: Basic usage with API key
async function basicExample() {
  console.log("=== Basic GPT-5 Example ===");

  // Initialize the client with your API key
  const client = new OpenAIClient("your-api-key-here");

  try {
    // Send a simple message
    const response = await client.sendMessage("Hello, how are you?");

    if (response.success) {
      console.log("GPT-5 Response:", response.content);
      console.log("Tokens used:", response.usage);
    } else {
      console.error("Error:", response.error);
    }
  } catch (error) {
    console.error("Failed to send message:", error);
  }
}

// Example 2: Conversation with system prompt
async function conversationExample() {
  console.log("\n=== Conversation Example ===");

  const client = new OpenAIClient("your-api-key-here");

  try {
    const response = await client.sendMessage(
      "What are the benefits of using AI chatbots for customer service?",
      {
        systemPrompt:
          "You are an expert in customer service and AI technology. Provide detailed, professional answers.",
        maxTokens: 500,
        temperature: 0.8,
      }
    );

    if (response.success) {
      console.log("Expert Response:", response.content);
    } else {
      console.error("Error:", response.error);
    }
  } catch (error) {
    console.error("Failed to send message:", error);
  }
}

// Example 3: Multi-turn conversation
async function multiTurnExample() {
  console.log("\n=== Multi-turn Conversation Example ===");

  const client = new OpenAIClient("your-api-key-here");

  try {
    const messages = [
      { role: "system", content: "You are a helpful salon booking assistant." },
      { role: "user", content: "I want to book a haircut for next week." },
      {
        role: "assistant",
        content:
          "I'd be happy to help you book a haircut! What day works best for you next week?",
      },
      { role: "user", content: "How about Tuesday afternoon?" },
    ];

    const response = await client.sendConversation(messages, {
      maxTokens: 300,
      temperature: 0.7,
    });

    if (response.success) {
      console.log("Assistant Response:", response.content);
    } else {
      console.error("Error:", response.error);
    }
  } catch (error) {
    console.error("Failed to send conversation:", error);
  }
}

// Example 4: Generate embeddings
async function embeddingsExample() {
  console.log("\n=== Embeddings Example ===");

  const client = new OpenAIClient("your-api-key-here");

  try {
    const response = await client.generateEmbeddings(
      "I need to book a hair appointment for next Tuesday",
      "text-embedding-3-large"
    );

    if (response.success) {
      console.log(
        "Embeddings generated:",
        response.embeddings.length,
        "dimensions"
      );
      console.log("First 5 values:", response.embeddings.slice(0, 5));
    } else {
      console.error("Error:", response.error);
    }
  } catch (error) {
    console.error("Failed to generate embeddings:", error);
  }
}

// Example 5: Salon-specific chatbot
async function salonChatbotExample() {
  console.log("\n=== Salon Chatbot Example ===");

  const client = new OpenAIClient("your-api-key-here");

  const salonSystemPrompt = `You are a professional salon booking assistant. You help customers with:
  - Booking appointments (haircuts, coloring, styling, etc.)
  - Rescheduling or canceling appointments
  - Answering questions about services and pricing
  - Providing information about salon policies and procedures
  
  Be friendly, professional, and helpful. Always confirm appointment details clearly.`;

  try {
    const response = await client.sendMessage(
      "I want to get my hair colored and cut. What services do you offer and what are your prices?",
      {
        systemPrompt: salonSystemPrompt,
        maxTokens: 400,
        temperature: 0.6,
      }
    );

    if (response.success) {
      console.log("Salon Assistant Response:", response.content);
    } else {
      console.error("Error:", response.error);
    }
  } catch (error) {
    console.error("Failed to send message:", error);
  }
}

// Run examples (uncomment the ones you want to test)
async function runExamples() {
  console.log("OpenAI GPT-5 API Examples");
  console.log("==========================");
  console.log(
    'Note: Replace "your-api-key-here" with your actual OpenAI API key'
  );
  console.log("");

  // Uncomment the examples you want to run:
  // await basicExample();
  // await conversationExample();
  // await multiTurnExample();
  // await embeddingsExample();
  // await salonChatbotExample();

  console.log("\nTo run these examples:");
  console.log("1. Get your API key from https://platform.openai.com/api-keys");
  console.log('2. Replace "your-api-key-here" with your actual API key');
  console.log("3. Uncomment the example functions you want to test");
  console.log("4. Run: node example-usage.js");
}

// Export functions for use in other modules
module.exports = {
  basicExample,
  conversationExample,
  multiTurnExample,
  embeddingsExample,
  salonChatbotExample,
  runExamples,
};

// Run examples if this file is executed directly
if (require.main === module) {
  runExamples();
}


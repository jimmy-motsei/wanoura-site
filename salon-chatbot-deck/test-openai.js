/**
 * Test script for OpenAI GPT-5 API integration
 * This script validates the API connection and basic functionality
 */

const OpenAIClient = require("./openai-client.js");
require("dotenv").config();

async function testOpenAIConnection() {
  console.log("🧪 Testing OpenAI GPT-5 API Connection");
  console.log("=====================================");

  // Check if API key is provided
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error(
      "❌ Error: OPENAI_API_KEY not found in environment variables"
    );
    console.log("Please:");
    console.log("1. Copy env.example to .env");
    console.log("2. Add your OpenAI API key to .env file");
    console.log(
      "3. Get your API key from: https://platform.openai.com/api-keys"
    );
    return false;
  }

  console.log("✅ API Key found");

  // Initialize client
  let client;
  try {
    client = new OpenAIClient(apiKey);
    console.log("✅ OpenAIClient initialized");
  } catch (error) {
    console.error("❌ Failed to initialize OpenAIClient:", error.message);
    return false;
  }

  // Test basic message
  console.log("\n📤 Testing basic message...");
  try {
    const response = await client.sendMessage(
      'Hello, this is a test message. Please respond with "API connection successful!"'
    );

    if (response.success) {
      console.log("✅ Basic message test passed");
      console.log("Response:", response.content);
      console.log("Model used:", response.model);
      console.log("Tokens used:", response.usage?.total_tokens || "N/A");
    } else {
      console.error("❌ Basic message test failed:", response.error);
      return false;
    }
  } catch (error) {
    console.error(
      "❌ Basic message test failed with exception:",
      error.message
    );
    return false;
  }

  // Test conversation
  console.log("\n💬 Testing conversation...");
  try {
    const messages = [
      { role: "system", content: "You are a helpful test assistant." },
      { role: "user", content: "What is 2+2?" },
      { role: "assistant", content: "2+2 equals 4." },
      { role: "user", content: "What about 3+3?" },
    ];

    const response = await client.sendConversation(messages, {
      maxTokens: 100,
      temperature: 0.1,
    });

    if (response.success) {
      console.log("✅ Conversation test passed");
      console.log("Response:", response.content);
    } else {
      console.error("❌ Conversation test failed:", response.error);
      return false;
    }
  } catch (error) {
    console.error("❌ Conversation test failed with exception:", error.message);
    return false;
  }

  // Test embeddings
  console.log("\n🔢 Testing embeddings...");
  try {
    const response = await client.generateEmbeddings(
      "This is a test for embeddings generation"
    );

    if (response.success) {
      console.log("✅ Embeddings test passed");
      console.log("Embedding dimensions:", response.embeddings.length);
      console.log("Model used:", response.model);
    } else {
      console.error("❌ Embeddings test failed:", response.error);
      return false;
    }
  } catch (error) {
    console.error("❌ Embeddings test failed with exception:", error.message);
    return false;
  }

  // Test salon-specific scenario
  console.log("\n💇 Testing salon chatbot scenario...");
  try {
    const salonPrompt =
      "You are a salon booking assistant. Help customers with appointments.";
    const response = await client.sendMessage(
      "I need to book a haircut for next Tuesday at 2 PM",
      {
        systemPrompt: salonPrompt,
        maxTokens: 200,
        temperature: 0.7,
      }
    );

    if (response.success) {
      console.log("✅ Salon chatbot test passed");
      console.log("Response:", response.content);
    } else {
      console.error("❌ Salon chatbot test failed:", response.error);
      return false;
    }
  } catch (error) {
    console.error(
      "❌ Salon chatbot test failed with exception:",
      error.message
    );
    return false;
  }

  console.log("\n🎉 All tests passed! OpenAI GPT-5 API is working correctly.");
  return true;
}

// Error handling wrapper
async function runTests() {
  try {
    const success = await testOpenAIConnection();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error("💥 Test suite failed with unexpected error:", error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { testOpenAIConnection };


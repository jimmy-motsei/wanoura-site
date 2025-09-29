/**
 * OpenAI GPT-5 API Client
 * Simple integration for connecting to OpenAI's GPT-5 model via API
 */

class OpenAIClient {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error("OpenAI API key is required");
    }
    this.apiKey = apiKey;
    this.baseURL = "https://api.openai.com/v1";
  }

  /**
   * Send a request to GPT-5
   * @param {string} message - The user's message/prompt
   * @param {Object} options - Additional options for the request
   * @returns {Promise<Object>} - The API response
   */
  async sendMessage(message, options = {}) {
    const {
      model = "gpt-5",
      maxTokens = 1000,
      temperature = 0.7,
      systemPrompt = "You are a helpful AI assistant.",
      ...otherOptions
    } = options;

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message },
          ],
          max_tokens: maxTokens,
          temperature: temperature,
          ...otherOptions,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `OpenAI API Error: ${response.status} - ${
            errorData.error?.message || response.statusText
          }`
        );
      }

      const data = await response.json();
      return {
        success: true,
        content: data.choices[0]?.message?.content || "",
        usage: data.usage,
        model: data.model,
      };
    } catch (error) {
      console.error("OpenAI API Error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Send multiple messages in a conversation
   * @param {Array} messages - Array of message objects with role and content
   * @param {Object} options - Additional options for the request
   * @returns {Promise<Object>} - The API response
   */
  async sendConversation(messages, options = {}) {
    const {
      model = "gpt-5",
      maxTokens = 1000,
      temperature = 0.7,
      ...otherOptions
    } = options;

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          max_tokens: maxTokens,
          temperature: temperature,
          ...otherOptions,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `OpenAI API Error: ${response.status} - ${
            errorData.error?.message || response.statusText
          }`
        );
      }

      const data = await response.json();
      return {
        success: true,
        content: data.choices[0]?.message?.content || "",
        usage: data.usage,
        model: data.model,
      };
    } catch (error) {
      console.error("OpenAI API Error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Generate embeddings for text
   * @param {string} text - Text to generate embeddings for
   * @param {string} model - Embedding model to use
   * @returns {Promise<Object>} - The embeddings response
   */
  async generateEmbeddings(text, model = "text-embedding-3-large") {
    try {
      const response = await fetch(`${this.baseURL}/embeddings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          input: text,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `OpenAI API Error: ${response.status} - ${
            errorData.error?.message || response.statusText
          }`
        );
      }

      const data = await response.json();
      return {
        success: true,
        embeddings: data.data[0]?.embedding || [],
        usage: data.usage,
        model: data.model,
      };
    } catch (error) {
      console.error("OpenAI API Error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

// Export for use in Node.js or browser
if (typeof module !== "undefined" && module.exports) {
  module.exports = OpenAIClient;
} else if (typeof window !== "undefined") {
  window.OpenAIClient = OpenAIClient;
}


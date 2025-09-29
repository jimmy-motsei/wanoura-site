/**
 * Salon-Specific AI Client
 * Enhanced OpenAI client with salon-specific prompts and conversation flows
 */

const OpenAIClient = require("./openai-client.js");

class SalonAIClient extends OpenAIClient {
  constructor(apiKey, salonConfig = {}) {
    super(apiKey);
    this.salonConfig = {
      salonName: salonConfig.salonName || "Maru Salon",
      services: salonConfig.services || [
        "Haircut & Styling",
        "Hair Coloring",
        "Highlights",
        "Balayage",
        "Hair Treatment",
        "Bridal Hair",
        "Men's Grooming",
      ],
      languages: salonConfig.languages || ["English", "Afrikaans"],
      businessHours:
        salonConfig.businessHours || "Mon-Fri: 9AM-6PM, Sat: 9AM-4PM",
      location: salonConfig.location || "Cape Town, South Africa",
      ...salonConfig,
    };
  }

  /**
   * Get salon-specific system prompt
   * @param {string} context - Conversation context
   * @returns {string} - System prompt
   */
  getSalonSystemPrompt(context = "general") {
    const basePrompt = `You are a professional salon booking assistant for ${
      this.salonConfig.salonName
    }. 

SALON INFORMATION:
- Name: ${this.salonConfig.salonName}
- Location: ${this.salonConfig.location}
- Business Hours: ${this.salonConfig.businessHours}
- Services: ${this.salonConfig.services.join(", ")}

CORE RESPONSIBILITIES:
1. Help customers book, reschedule, or cancel appointments
2. Provide information about services and pricing
3. Answer questions about salon policies and procedures
4. Offer personalized service recommendations
5. Handle complaints and escalations professionally

COMMUNICATION STYLE:
- Be friendly, professional, and helpful
- Use a warm, welcoming tone
- Always confirm appointment details clearly
- Ask clarifying questions when needed
- Be empathetic and understanding

MULTILINGUAL SUPPORT:
- Primary language: English
- Secondary languages: ${this.salonConfig.languages.slice(1).join(", ")}
- Respond in the customer's preferred language when possible

BOOKING PROCESS:
1. Greet the customer warmly
2. Understand their service needs
3. Check availability for their preferred time
4. Confirm appointment details (service, date, time, stylist)
5. Provide confirmation and next steps

ESCALATION TRIGGERS:
- Complex technical issues
- Complaints about service quality
- Billing disputes
- Requests for management
- Sensitive personal situations`;

    const contextPrompts = {
      booking:
        basePrompt +
        "\n\nFOCUS: Help the customer book an appointment. Ask about their preferred service, date, and time.",
      support:
        basePrompt +
        "\n\nFOCUS: Provide customer support and answer questions about services, policies, or previous appointments.",
      sales:
        basePrompt +
        "\n\nFOCUS: Recommend additional services and upsell when appropriate, but always be helpful, not pushy.",
      complaint:
        basePrompt +
        "\n\nFOCUS: Handle complaints professionally. Listen, empathize, and offer solutions. Escalate to management if needed.",
    };

    return contextPrompts[context] || basePrompt;
  }

  /**
   * Process salon conversation with context awareness
   * @param {string} message - Customer message
   * @param {Object} conversationHistory - Previous messages
   * @param {string} context - Current conversation context
   * @returns {Promise<Object>} - AI response with salon context
   */
  async processSalonMessage(
    message,
    conversationHistory = [],
    context = "general"
  ) {
    try {
      // Build conversation with system prompt
      const messages = [
        { role: "system", content: this.getSalonSystemPrompt(context) },
        ...conversationHistory,
        { role: "user", content: message },
      ];

      const response = await this.sendConversation(messages, {
        maxTokens: 500,
        temperature: 0.7,
      });

      if (response.success) {
        // Add salon-specific metadata
        return {
          ...response,
          salonContext: {
            salonName: this.salonConfig.salonName,
            services: this.salonConfig.services,
            businessHours: this.salonConfig.businessHours,
            location: this.salonConfig.location,
          },
          suggestedActions: this.extractSuggestedActions(response.content),
        };
      }

      return response;
    } catch (error) {
      console.error("Salon AI processing error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Extract suggested actions from AI response
   * @param {string} content - AI response content
   * @returns {Array} - Array of suggested actions
   */
  extractSuggestedActions(content) {
    const actions = [];
    const lowerContent = content.toLowerCase();

    if (lowerContent.includes("book") || lowerContent.includes("appointment")) {
      actions.push("BOOK_APPOINTMENT");
    }
    if (
      lowerContent.includes("reschedule") ||
      lowerContent.includes("change")
    ) {
      actions.push("RESCHEDULE_APPOINTMENT");
    }
    if (lowerContent.includes("cancel")) {
      actions.push("CANCEL_APPOINTMENT");
    }
    if (lowerContent.includes("price") || lowerContent.includes("cost")) {
      actions.push("SHOW_PRICING");
    }
    if (
      lowerContent.includes("service") ||
      lowerContent.includes("treatment")
    ) {
      actions.push("SHOW_SERVICES");
    }
    if (lowerContent.includes("time") || lowerContent.includes("available")) {
      actions.push("CHECK_AVAILABILITY");
    }
    if (
      lowerContent.includes("complaint") ||
      lowerContent.includes("problem")
    ) {
      actions.push("ESCALATE_TO_MANAGER");
    }

    return actions;
  }

  /**
   * Generate service recommendations based on customer needs
   * @param {string} customerMessage - Customer's message
   * @param {Object} customerProfile - Customer profile data
   * @returns {Promise<Object>} - Service recommendations
   */
  async generateServiceRecommendations(customerMessage, customerProfile = {}) {
    try {
      const recommendationPrompt = `Based on this customer message and profile, recommend appropriate salon services:

CUSTOMER MESSAGE: "${customerMessage}"
CUSTOMER PROFILE: ${JSON.stringify(customerProfile, null, 2)}

AVAILABLE SERVICES: ${this.salonConfig.services.join(", ")}

Provide 2-3 specific service recommendations with brief explanations of why they would be suitable.`;

      const response = await this.sendMessage(recommendationPrompt, {
        systemPrompt:
          "You are a salon service expert. Provide helpful, personalized service recommendations.",
        maxTokens: 300,
        temperature: 0.6,
      });

      return response;
    } catch (error) {
      console.error("Service recommendation error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Handle multilingual conversations
   * @param {string} message - Customer message
   * @param {string} detectedLanguage - Detected language
   * @returns {Promise<Object>} - Response in appropriate language
   */
  async handleMultilingualMessage(message, detectedLanguage = "en") {
    try {
      const languagePrompts = {
        en: "Respond in English with a professional, friendly tone.",
        af: "Respond in Afrikaans with a professional, friendly tone.",
        zu: "Respond in Zulu with a professional, friendly tone.",
        xh: "Respond in Xhosa with a professional, friendly tone.",
      };

      const systemPrompt =
        this.getSalonSystemPrompt() +
        "\n\n" +
        (languagePrompts[detectedLanguage] || languagePrompts.en);

      const response = await this.sendMessage(message, {
        systemPrompt,
        maxTokens: 500,
        temperature: 0.7,
      });

      return {
        ...response,
        detectedLanguage,
        isMultilingual: detectedLanguage !== "en",
      };
    } catch (error) {
      console.error("Multilingual processing error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Generate appointment confirmation message
   * @param {Object} appointmentDetails - Appointment details
   * @returns {string} - Formatted confirmation message
   */
  generateAppointmentConfirmation(appointmentDetails) {
    const { service, date, time, stylist, customerName, phone } =
      appointmentDetails;

    return `🎉 *Appointment Confirmed!*

Hi ${customerName}! Your appointment has been confirmed:

📅 *Date:* ${date}
🕐 *Time:* ${time}
💇 *Service:* ${service}
👨‍💼 *Stylist:* ${stylist}

📍 *Location:* ${this.salonConfig.location}
📞 *Phone:* ${phone}

*Important Reminders:*
• Please arrive 10 minutes early
• Bring a valid ID
• Cancel or reschedule at least 24 hours in advance

We can't wait to see you! If you have any questions, just reply to this message.

*${this.salonConfig.salonName} Team* 💫`;
  }

  /**
   * Generate reminder message
   * @param {Object} appointmentDetails - Appointment details
   * @param {string} reminderType - Type of reminder (24h, 2h, etc.)
   * @returns {string} - Formatted reminder message
   */
  generateReminderMessage(appointmentDetails, reminderType = "24h") {
    const { service, date, time, stylist, customerName } = appointmentDetails;

    const reminderTexts = {
      "24h": "⏰ *Reminder: Your appointment is tomorrow!*",
      "2h": "⏰ *Reminder: Your appointment is in 2 hours!*",
      "30m": "⏰ *Reminder: Your appointment is in 30 minutes!*",
    };

    return `${reminderTexts[reminderType] || reminderTexts["24h"]}

Hi ${customerName}! Just a friendly reminder about your appointment:

📅 *Date:* ${date}
🕐 *Time:* ${time}
💇 *Service:* ${service}
👨‍💼 *Stylist:* ${stylist}

📍 *Location:* ${this.salonConfig.location}

We're excited to see you! If you need to reschedule, please let us know as soon as possible.

*${this.salonConfig.salonName} Team* 💫`;
  }
}

// Export for use in Node.js or browser
if (typeof module !== "undefined" && module.exports) {
  module.exports = SalonAIClient;
} else if (typeof window !== "undefined") {
  window.SalonAIClient = SalonAIClient;
}


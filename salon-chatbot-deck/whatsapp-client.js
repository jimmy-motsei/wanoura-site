/**
 * WhatsApp Business API Client
 * Handles WhatsApp messaging for the salon chatbot platform
 */

class WhatsAppClient {
  constructor(accessToken, phoneNumberId, webhookVerifyToken) {
    if (!accessToken || !phoneNumberId) {
      throw new Error("WhatsApp access token and phone number ID are required");
    }

    this.accessToken = accessToken;
    this.phoneNumberId = phoneNumberId;
    this.webhookVerifyToken = webhookVerifyToken;
    this.baseURL = "https://graph.facebook.com/v18.0";
  }

  /**
   * Send a text message
   * @param {string} to - Recipient phone number (with country code)
   * @param {string} message - Message text
   * @returns {Promise<Object>} - API response
   */
  async sendTextMessage(to, message) {
    try {
      const response = await fetch(
        `${this.baseURL}/${this.phoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.accessToken}`,
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: to,
            type: "text",
            text: { body: message },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `WhatsApp API Error: ${response.status} - ${
            errorData.error?.message || response.statusText
          }`
        );
      }

      const data = await response.json();
      return {
        success: true,
        messageId: data.messages[0]?.id,
        data: data,
      };
    } catch (error) {
      console.error("WhatsApp API Error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Send a template message (for notifications, confirmations)
   * @param {string} to - Recipient phone number
   * @param {string} templateName - Template name
   * @param {Array} parameters - Template parameters
   * @returns {Promise<Object>} - API response
   */
  async sendTemplateMessage(to, templateName, parameters = []) {
    try {
      const response = await fetch(
        `${this.baseURL}/${this.phoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.accessToken}`,
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: to,
            type: "template",
            template: {
              name: templateName,
              language: { code: "en" },
              components: [
                {
                  type: "body",
                  parameters: parameters.map((param) => ({
                    type: "text",
                    text: param,
                  })),
                },
              ],
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `WhatsApp API Error: ${response.status} - ${
            errorData.error?.message || response.statusText
          }`
        );
      }

      const data = await response.json();
      return {
        success: true,
        messageId: data.messages[0]?.id,
        data: data,
      };
    } catch (error) {
      console.error("WhatsApp API Error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Send an interactive message with buttons
   * @param {string} to - Recipient phone number
   * @param {string} headerText - Header text
   * @param {string} bodyText - Body text
   * @param {string} footerText - Footer text
   * @param {Array} buttons - Array of button objects
   * @returns {Promise<Object>} - API response
   */
  async sendInteractiveMessage(to, headerText, bodyText, footerText, buttons) {
    try {
      const response = await fetch(
        `${this.baseURL}/${this.phoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.accessToken}`,
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: to,
            type: "interactive",
            interactive: {
              type: "button",
              header: {
                type: "text",
                text: headerText,
              },
              body: {
                text: bodyText,
              },
              footer: {
                text: footerText,
              },
              action: {
                buttons: buttons.map((button, index) => ({
                  type: "reply",
                  reply: {
                    id: button.id || `btn_${index}`,
                    title: button.title,
                  },
                })),
              },
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `WhatsApp API Error: ${response.status} - ${
            errorData.error?.message || response.statusText
          }`
        );
      }

      const data = await response.json();
      return {
        success: true,
        messageId: data.messages[0]?.id,
        data: data,
      };
    } catch (error) {
      console.error("WhatsApp API Error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Send a list message for service selection
   * @param {string} to - Recipient phone number
   * @param {string} headerText - Header text
   * @param {string} bodyText - Body text
   * @param {string} footerText - Footer text
   * @param {string} buttonText - Button text
   * @param {Array} sections - Array of section objects
   * @returns {Promise<Object>} - API response
   */
  async sendListMessage(
    to,
    headerText,
    bodyText,
    footerText,
    buttonText,
    sections
  ) {
    try {
      const response = await fetch(
        `${this.baseURL}/${this.phoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.accessToken}`,
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: to,
            type: "interactive",
            interactive: {
              type: "list",
              header: {
                type: "text",
                text: headerText,
              },
              body: {
                text: bodyText,
              },
              footer: {
                text: footerText,
              },
              action: {
                button: buttonText,
                sections: sections,
              },
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `WhatsApp API Error: ${response.status} - ${
            errorData.error?.message || response.statusText
          }`
        );
      }

      const data = await response.json();
      return {
        success: true,
        messageId: data.messages[0]?.id,
        data: data,
      };
    } catch (error) {
      console.error("WhatsApp API Error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Verify webhook challenge
   * @param {string} mode - Verification mode
   * @param {string} token - Verification token
   * @param {string} challenge - Challenge string
   * @returns {boolean} - Verification result
   */
  verifyWebhook(mode, token, challenge) {
    if (mode === "subscribe" && token === this.webhookVerifyToken) {
      return challenge;
    }
    return false;
  }

  /**
   * Process incoming webhook message
   * @param {Object} webhookData - Webhook payload
   * @returns {Object} - Processed message data
   */
  processWebhookMessage(webhookData) {
    try {
      const entry = webhookData.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      if (!value?.messages) {
        return { success: false, error: "No messages found" };
      }

      const message = value.messages[0];
      const contact = value.contacts?.[0];

      return {
        success: true,
        messageId: message.id,
        from: message.from,
        timestamp: message.timestamp,
        type: message.type,
        text: message.text?.body,
        contact: {
          name: contact?.profile?.name,
          phone: message.from,
        },
        context: message.context,
      };
    } catch (error) {
      console.error("Webhook processing error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

// Export for use in Node.js or browser
if (typeof module !== "undefined" && module.exports) {
  module.exports = WhatsAppClient;
} else if (typeof window !== "undefined") {
  window.WhatsAppClient = WhatsAppClient;
}


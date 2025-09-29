/**
 * Salon Chatbot Orchestrator
 * Main chatbot that coordinates all components for the salon platform
 */

const WhatsAppClient = require("./whatsapp-client.js");
const SalonAIClient = require("./salon-ai-client.js");
const BookingManager = require("./booking-manager.js");
const HubSpotClient = require("./hubspot-client.js");
const AnalyticsTracker = require("./analytics-tracker.js");
const ErrorHandler = require("./error-handler.js");
const InputValidator = require("./input-validator.js");

class SalonChatbot {
  constructor(config = {}) {
    this.config = {
      // WhatsApp configuration
      whatsapp: {
        accessToken:
          config.whatsapp?.accessToken || process.env.WHATSAPP_ACCESS_TOKEN,
        phoneNumberId:
          config.whatsapp?.phoneNumberId ||
          process.env.WHATSAPP_PHONE_NUMBER_ID,
        webhookVerifyToken:
          config.whatsapp?.webhookVerifyToken ||
          process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN,
      },

      // OpenAI configuration
      openai: {
        apiKey: config.openai?.apiKey || process.env.OPENAI_API_KEY,
        salonConfig: config.openai?.salonConfig || {},
      },

      // Booking configuration
      booking: config.booking || {},

      // HubSpot configuration
      hubspot: {
        accessToken:
          config.hubspot?.accessToken || process.env.HUBSPOT_ACCESS_TOKEN,
        portalId: config.hubspot?.portalId || process.env.HUBSPOT_PORTAL_ID,
      },

      // Analytics configuration
      analytics: config.analytics || {},

      ...config,
    };

    // Initialize components
    this.initializeComponents();

    // Conversation state management
    this.conversationStates = new Map();

    // Customer profiles cache
    this.customerProfiles = new Map();

    // Start conversation cleanup interval
    this.startConversationCleanup();
  }

  /**
   * Initialize all chatbot components
   */
  initializeComponents() {
    try {
      // Initialize WhatsApp client
      this.whatsapp = new WhatsAppClient(
        this.config.whatsapp.accessToken,
        this.config.whatsapp.phoneNumberId,
        this.config.whatsapp.webhookVerifyToken
      );

      // Initialize AI client
      this.ai = new SalonAIClient(
        this.config.openai.apiKey,
        this.config.openai.salonConfig
      );

      // Initialize booking manager
      this.booking = new BookingManager(this.config.booking);

      // Initialize HubSpot client
      this.hubspot = new HubSpotClient(
        this.config.hubspot.accessToken,
        this.config.hubspot.portalId
      );

      // Initialize analytics tracker
      this.analytics = new AnalyticsTracker(this.config.analytics);

      console.log("✅ All salon chatbot components initialized successfully");
    } catch (error) {
      console.error("❌ Error initializing salon chatbot components:", error);
      throw error;
    }
  }

  /**
   * Process incoming WhatsApp message
   * @param {Object} webhookData - WhatsApp webhook data
   * @returns {Promise<Object>} - Processing result
   */
  async processMessage(webhookData) {
    try {
      // Validate webhook data
      const webhookValidation = InputValidator.validateWebhookData(webhookData);
      if (!webhookValidation.isValid) {
        return ErrorHandler.createErrorResponse(webhookValidation.error, "INVALID_WEBHOOK");
      }

      // Parse WhatsApp message
      const messageData = this.whatsapp.processWebhookMessage(webhookData);

      if (!messageData.success) {
        return { success: false, error: messageData.error };
      }

      const { from, text, contact, messageId } = messageData;

      // Validate message data
      const messageValidation = InputValidator.validateWhatsAppMessage(messageData);
      if (!messageValidation.isValid) {
        return ErrorHandler.handleValidationError(messageValidation.errors);
      }

      // Get or create customer profile
      const customerProfile = await this.getCustomerProfile(from);

      // Get conversation history
      const conversationHistory = this.getConversationHistory(from);

      // Determine conversation context
      const context = this.determineConversationContext(
        text,
        conversationHistory
      );

      // Process with AI
      const aiResponse = await this.ai.processSalonMessage(
        text,
        conversationHistory,
        context
      );

      if (!aiResponse.success) {
        return { success: false, error: aiResponse.error };
      }

      // Handle suggested actions
      const actionResult = await this.handleSuggestedActions(
        aiResponse.suggestedActions,
        from,
        text,
        customerProfile
      );

      // Send response via WhatsApp
      const whatsappResponse = await this.whatsapp.sendTextMessage(
        from,
        aiResponse.content
      );

      // Update conversation state
      this.updateConversationState(from, {
        lastMessage: text,
        lastResponse: aiResponse.content,
        context,
        timestamp: new Date().toISOString(),
      });

      // Track analytics
      this.trackConversationMetrics(from, text, aiResponse, actionResult);

      // Update customer profile
      await this.updateCustomerProfile(from, {
        lastInteraction: new Date().toISOString(),
        lastMessage: text,
        conversationCount: (customerProfile.conversationCount || 0) + 1,
      });

      return {
        success: true,
        messageId: whatsappResponse.messageId,
        aiResponse: aiResponse.content,
        actions: actionResult,
      };
    } catch (error) {
      console.error("Error processing message:", error);
      return ErrorHandler.handleApiError(error, "Message Processing");
    }
  }

  /**
   * Handle suggested actions from AI
   * @param {Array} actions - Suggested actions
   * @param {string} customerId - Customer ID
   * @param {string} message - Customer message
   * @param {Object} customerProfile - Customer profile
   * @returns {Promise<Object>} - Action results
   */
  async handleSuggestedActions(actions, customerId, message, customerProfile) {
    const results = {};

    for (const action of actions) {
      try {
        switch (action) {
          case "BOOK_APPOINTMENT":
            results.booking = await this.handleBookingRequest(
              customerId,
              message,
              customerProfile
            );
            break;

          case "RESCHEDULE_APPOINTMENT":
            results.reschedule = await this.handleRescheduleRequest(
              customerId,
              message,
              customerProfile
            );
            break;

          case "CANCEL_APPOINTMENT":
            results.cancellation = await this.handleCancellationRequest(
              customerId,
              message,
              customerProfile
            );
            break;

          case "SHOW_PRICING":
            results.pricing = await this.handlePricingRequest(
              customerId,
              message,
              customerProfile
            );
            break;

          case "SHOW_SERVICES":
            results.services = await this.handleServicesRequest(
              customerId,
              message,
              customerProfile
            );
            break;

          case "CHECK_AVAILABILITY":
            results.availability = await this.handleAvailabilityRequest(
              customerId,
              message,
              customerProfile
            );
            break;

          case "ESCALATE_TO_MANAGER":
            results.escalation = await this.handleEscalationRequest(
              customerId,
              message,
              customerProfile
            );
            break;
        }
      } catch (error) {
        console.error(`Error handling action ${action}:`, error);
        results[action.toLowerCase()] = {
          success: false,
          error: error.message,
        };
      }
    }

    return results;
  }

  /**
   * Handle booking request
   * @param {string} customerId - Customer ID
   * @param {string} message - Customer message
   * @param {Object} customerProfile - Customer profile
   * @returns {Promise<Object>} - Booking result
   */
  async handleBookingRequest(customerId, message, customerProfile) {
    try {
      // Extract booking information from message
      const bookingInfo = this.extractBookingInfo(message);

      if (!bookingInfo.serviceId) {
        // Send service selection message
        const serviceMessage = await this.sendServiceSelectionMessage(
          customerId
        );
        return { success: true, requiresInput: true, message: serviceMessage };
      }

      // Check availability
      const availableSlots = await this.booking.getAvailableSlots(
        bookingInfo.date,
        bookingInfo.serviceId,
        bookingInfo.stylistId
      );

      if (availableSlots.length === 0) {
        return {
          success: false,
          message:
            "Sorry, no available slots for that date and service. Please try a different date or service.",
        };
      }

      // Create booking
      const bookingData = {
        customerName: customerProfile.name || "Customer",
        customerPhone: customerId,
        customerEmail: customerProfile.email,
        serviceId: bookingInfo.serviceId,
        date: bookingInfo.date,
        time: bookingInfo.time || availableSlots[0].time,
        stylistId: bookingInfo.stylistId,
        notes: message,
      };

      const bookingResult = await this.booking.createBooking(bookingData);

      if (bookingResult.success) {
        // Create HubSpot contact and deal
        await this.syncToHubSpot(
          customerId,
          customerProfile,
          bookingResult.booking
        );

        // Send confirmation message
        await this.whatsapp.sendTextMessage(
          customerId,
          bookingResult.confirmationMessage
        );
      }

      return bookingResult;
    } catch (error) {
      console.error("Error handling booking request:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle reschedule request
   * @param {string} customerId - Customer ID
   * @param {string} message - Customer message
   * @param {Object} customerProfile - Customer profile
   * @returns {Promise<Object>} - Reschedule result
   */
  async handleRescheduleRequest(customerId, message, customerProfile) {
    try {
      // Get customer's existing bookings
      const existingBookings = this.booking.getCustomerBookings(customerId);

      if (existingBookings.length === 0) {
        return {
          success: false,
          message:
            "No existing bookings found. Would you like to make a new appointment?",
        };
      }

      // Extract reschedule information
      const rescheduleInfo = this.extractRescheduleInfo(message);

      if (!rescheduleInfo.bookingId) {
        // Send booking selection message
        const bookingMessage = await this.sendBookingSelectionMessage(
          customerId,
          existingBookings
        );
        return { success: true, requiresInput: true, message: bookingMessage };
      }

      // Reschedule booking
      const rescheduleResult = await this.booking.rescheduleBooking(
        rescheduleInfo.bookingId,
        rescheduleInfo.newDate,
        rescheduleInfo.newTime
      );

      if (rescheduleResult.success) {
        // Send confirmation message
        await this.whatsapp.sendTextMessage(
          customerId,
          rescheduleResult.rescheduleMessage
        );
      }

      return rescheduleResult;
    } catch (error) {
      console.error("Error handling reschedule request:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle cancellation request
   * @param {string} customerId - Customer ID
   * @param {string} message - Customer message
   * @param {Object} customerProfile - Customer profile
   * @returns {Promise<Object>} - Cancellation result
   */
  async handleCancellationRequest(customerId, message, customerProfile) {
    try {
      // Get customer's existing bookings
      const existingBookings = this.booking.getCustomerBookings(customerId);

      if (existingBookings.length === 0) {
        return {
          success: false,
          message: "No existing bookings found to cancel.",
        };
      }

      // Extract cancellation information
      const cancellationInfo = this.extractCancellationInfo(message);

      if (!cancellationInfo.bookingId) {
        // Send booking selection message
        const bookingMessage = await this.sendBookingSelectionMessage(
          customerId,
          existingBookings
        );
        return { success: true, requiresInput: true, message: bookingMessage };
      }

      // Cancel booking
      const cancellationResult = await this.booking.cancelBooking(
        cancellationInfo.bookingId,
        cancellationInfo.reason
      );

      if (cancellationResult.success) {
        // Send confirmation message
        await this.whatsapp.sendTextMessage(
          customerId,
          cancellationResult.cancellationMessage
        );
      }

      return cancellationResult;
    } catch (error) {
      console.error("Error handling cancellation request:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle pricing request
   * @param {string} customerId - Customer ID
   * @param {string} message - Customer message
   * @param {Object} customerProfile - Customer profile
   * @returns {Promise<Object>} - Pricing result
   */
  async handlePricingRequest(customerId, message, customerProfile) {
    try {
      const services = this.booking.config.services;
      const pricingMessage = this.formatPricingMessage(services);

      await this.whatsapp.sendTextMessage(customerId, pricingMessage);

      return { success: true, message: pricingMessage };
    } catch (error) {
      console.error("Error handling pricing request:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle services request
   * @param {string} customerId - Customer ID
   * @param {string} message - Customer message
   * @param {Object} customerProfile - Customer profile
   * @returns {Promise<Object>} - Services result
   */
  async handleServicesRequest(customerId, message, customerProfile) {
    try {
      const services = this.booking.config.services;
      const servicesMessage = this.formatServicesMessage(services);

      await this.whatsapp.sendTextMessage(customerId, servicesMessage);

      return { success: true, message: servicesMessage };
    } catch (error) {
      console.error("Error handling services request:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle availability request
   * @param {string} customerId - Customer ID
   * @param {string} message - Customer message
   * @param {Object} customerProfile - Customer profile
   * @returns {Promise<Object>} - Availability result
   */
  async handleAvailabilityRequest(customerId, message, customerProfile) {
    try {
      const availabilityInfo = this.extractAvailabilityInfo(message);

      if (!availabilityInfo.serviceId) {
        const serviceMessage = await this.sendServiceSelectionMessage(
          customerId
        );
        return { success: true, requiresInput: true, message: serviceMessage };
      }

      const availableSlots = await this.booking.getAvailableSlots(
        availabilityInfo.date,
        availabilityInfo.serviceId,
        availabilityInfo.stylistId
      );

      const availabilityMessage =
        this.formatAvailabilityMessage(availableSlots);

      await this.whatsapp.sendTextMessage(customerId, availabilityMessage);

      return { success: true, message: availabilityMessage };
    } catch (error) {
      console.error("Error handling availability request:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle escalation request
   * @param {string} customerId - Customer ID
   * @param {string} message - Customer message
   * @param {Object} customerProfile - Customer profile
   * @returns {Promise<Object>} - Escalation result
   */
  async handleEscalationRequest(customerId, message, customerProfile) {
    try {
      // Create HubSpot ticket
      const ticketResult = await this.hubspot.createTicket({
        contactId: customerProfile.hubspotContactId,
        subject: "Customer Escalation",
        content: `Customer: ${customerProfile.name}\nPhone: ${customerId}\nMessage: ${message}`,
        priority: "HIGH",
        category: "escalation",
      });

      // Send escalation message
      const escalationMessage = `I understand your concern and have escalated this to our management team. They will contact you shortly. Your reference number is: ${ticketResult.ticketId}`;

      await this.whatsapp.sendTextMessage(customerId, escalationMessage);

      return {
        success: true,
        message: escalationMessage,
        ticketId: ticketResult.ticketId,
      };
    } catch (error) {
      console.error("Error handling escalation request:", error);
      return { success: false, error: error.message };
    }
  }

  // Helper methods
  async getCustomerProfile(customerId) {
    if (this.customerProfiles.has(customerId)) {
      return this.customerProfiles.get(customerId);
    }

    // Try to get from HubSpot
    const hubspotResult = await this.hubspot.getContact(customerId);

    if (hubspotResult.success && hubspotResult.contacts.length > 0) {
      const contact = hubspotResult.contacts[0];
      const profile = {
        id: contact.id,
        name: this.sanitizeName(contact.properties.firstname, contact.properties.lastname),
        email: contact.properties.email,
        phone: contact.properties.phone,
        hubspotContactId: contact.id,
        lastInteraction: contact.properties.lastmodifieddate,
      };

      this.customerProfiles.set(customerId, profile);
      return profile;
    }

    // Create new profile
    const newProfile = {
      id: customerId,
      name: "Customer",
      phone: customerId,
      lastInteraction: new Date().toISOString(),
      conversationCount: 0,
    };

    this.customerProfiles.set(customerId, newProfile);
    return newProfile;
  }

  async updateCustomerProfile(customerId, updates) {
    const profile = this.customerProfiles.get(customerId) || {};
    const updatedProfile = { ...profile, ...updates };
    this.customerProfiles.set(customerId, updatedProfile);
  }

  getConversationHistory(customerId) {
    const state = this.conversationStates.get(customerId);
    return state ? state.history || [] : [];
  }

  updateConversationState(customerId, updates) {
    const state = this.conversationStates.get(customerId) || { history: [] };
    const updatedState = { ...state, ...updates };
    updatedState.history.push({
      role: "user",
      content: updates.lastMessage,
    });
    updatedState.history.push({
      role: "assistant",
      content: updates.lastResponse,
    });
    this.conversationStates.set(customerId, updatedState);
  }

  determineConversationContext(message, history) {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes("book") || lowerMessage.includes("appointment")) {
      return "booking";
    } else if (
      lowerMessage.includes("cancel") ||
      lowerMessage.includes("reschedule")
    ) {
      return "support";
    } else if (
      lowerMessage.includes("price") ||
      lowerMessage.includes("cost")
    ) {
      return "sales";
    } else if (
      lowerMessage.includes("complaint") ||
      lowerMessage.includes("problem")
    ) {
      return "complaint";
    }

    return "general";
  }

  extractBookingInfo(message) {
    // Simple extraction - in production, use NLP
    const lowerMessage = message.toLowerCase();

    return {
      serviceId: this.extractServiceId(lowerMessage),
      date: this.extractDate(lowerMessage),
      time: this.extractTime(lowerMessage),
      stylistId: this.extractStylistId(lowerMessage),
    };
  }

  extractServiceId(message) {
    const services = this.booking.config.services;
    for (const service of services) {
      if (
        message.includes(service.name.toLowerCase()) ||
        message.includes(service.id)
      ) {
        return service.id;
      }
    }
    return null;
  }

  extractDate(message) {
    // Simple date extraction - in production, use proper date parsing
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    if (message.includes("tomorrow")) {
      return tomorrow.toISOString().split("T")[0];
    }

    return tomorrow.toISOString().split("T")[0]; // Default to tomorrow
  }

  extractTime(message) {
    // Simple time extraction - in production, use proper time parsing
    if (message.includes("morning")) return "09:00";
    if (message.includes("afternoon")) return "14:00";
    if (message.includes("evening")) return "17:00";

    return null; // Let system choose
  }

  extractStylistId(message) {
    const stylists = this.booking.config.stylists;
    for (const stylist of stylists) {
      if (
        message.includes(stylist.name.toLowerCase()) ||
        message.includes(stylist.id)
      ) {
        return stylist.id;
      }
    }
    return null;
  }

  extractRescheduleInfo(message) {
    // Simple extraction - in production, use NLP
    return {
      bookingId: this.extractBookingId(message),
      newDate: this.extractDate(message),
      newTime: this.extractTime(message),
    };
  }

  extractCancellationInfo(message) {
    // Simple extraction - in production, use NLP
    return {
      bookingId: this.extractBookingId(message),
      reason: this.extractReason(message),
    };
  }

  extractAvailabilityInfo(message) {
    return {
      serviceId: this.extractServiceId(message),
      date: this.extractDate(message),
      stylistId: this.extractStylistId(message),
    };
  }

  extractBookingId(message) {
    // Look for booking ID pattern
    const match = message.match(/BK[A-Z0-9]+/);
    return match ? match[0] : null;
  }

  extractReason(message) {
    // Simple reason extraction
    return message.includes("reason") ? message : "Customer request";
  }

  async sendServiceSelectionMessage(customerId) {
    const services = this.booking.config.services;
    const message = `Please select a service:\n\n${services
      .map(
        (service, index) => `${index + 1}. ${service.name} - R${service.price}`
      )
      .join("\n")}\n\nReply with the number of your choice.`;

    await this.whatsapp.sendTextMessage(customerId, message);
    return message;
  }

  async sendBookingSelectionMessage(customerId, bookings) {
    const message = `Please select a booking to reschedule/cancel:\n\n${bookings
      .map(
        (booking, index) =>
          `${index + 1}. ${booking.serviceName} on ${booking.date} at ${
            booking.time
          } (ID: ${booking.id})`
      )
      .join("\n")}\n\nReply with the number of your choice.`;

    await this.whatsapp.sendTextMessage(customerId, message);
    return message;
  }

  formatPricingMessage(services) {
    return `💇 *Our Services & Pricing*\n\n${services
      .map(
        (service) =>
          `• ${service.name}: R${service.price} (${service.duration} minutes)`
      )
      .join("\n")}\n\n*Book now by replying with your preferred service!*`;
  }

  formatServicesMessage(services) {
    return `✨ *Available Services*\n\n${services
      .map((service) => `• ${service.name} - ${service.duration} minutes`)
      .join("\n")}\n\n*What service interests you?*`;
  }

  formatAvailabilityMessage(slots) {
    if (slots.length === 0) {
      return "Sorry, no available slots for that date and service. Please try a different date or service.";
    }

    return `📅 *Available Time Slots*\n\n${slots
      .slice(0, 5)
      .map((slot) => `• ${slot.time} - ${slot.endTime}`)
      .join("\n")}\n\n*Reply with your preferred time to book!*`;
  }

  async syncToHubSpot(customerId, customerProfile, booking) {
    try {
      // Create or update contact
      const contactResult = await this.hubspot.createOrUpdateContact({
        email: customerProfile.email,
        phone: customerId,
        firstName: customerProfile.name?.split(" ")[0],
        lastName: customerProfile.name?.split(" ").slice(1).join(" "),
        properties: this.hubspot.formatSalonContactProperties({
          preferredServices: [booking.serviceName],
          lastAppointment: booking.date,
          totalAppointments: 1,
          totalSpent: booking.price,
        }),
      });

      if (contactResult.success) {
        // Create deal
        await this.hubspot.createDeal({
          contactId: contactResult.contactId,
          ...this.hubspot.formatSalonDealProperties(booking),
        });

        // Log interaction
        await this.hubspot.logInteraction({
          contactId: contactResult.contactId,
          interactionType: "BOOKING_CREATED",
          content: `Booking created: ${booking.serviceName} on ${booking.date}`,
          channel: "whatsapp",
        });
      }
    } catch (error) {
      console.error("Error syncing to HubSpot:", error);
    }
  }

  trackConversationMetrics(customerId, message, aiResponse, actionResult) {
    try {
      this.analytics.trackConversation({
        customerId,
        messageType: "text",
        responseTime: aiResponse.responseTime || 0,
        language: "en", // In production, detect language
        channel: "whatsapp",
      });

      if (actionResult.booking?.success) {
        this.analytics.trackBooking({
          customerId,
          bookingId: actionResult.booking.booking?.id,
          serviceType: actionResult.booking.booking?.serviceName,
          value: actionResult.booking.booking?.price,
          bookingDate: actionResult.booking.booking?.date,
          stylistId: actionResult.booking.booking?.stylistId,
        });
      }
    } catch (error) {
      console.error("Error tracking conversation metrics:", error);
    }
  }

  /**
   * Get analytics dashboard data
   * @param {string} period - Time period (day, week, month)
   * @returns {Object} - Dashboard data
   */
  getAnalyticsDashboard(period = "day") {
    return this.analytics.getDashboardData(period);
  }

  /**
   * Start conversation cleanup interval
   */
  startConversationCleanup() {
    // Clean up old conversations every 5 minutes
    setInterval(() => {
      this.cleanupOldConversations();
    }, 5 * 60 * 1000);
  }

  /**
   * Clean up old conversation states to prevent memory leaks
   */
  cleanupOldConversations() {
    try {
      const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
      let cleanedCount = 0;

      for (const [customerId, state] of this.conversationStates) {
        const lastActivity = new Date(state.timestamp || 0).getTime();
        if (lastActivity < cutoffTime) {
          this.conversationStates.delete(customerId);
          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
        console.log(`🧹 Cleaned up ${cleanedCount} old conversation states`);
      }
    } catch (error) {
      console.error("Error cleaning up old conversations:", error);
    }
  }

  /**
   * Sanitize and safely concatenate names
   * @param {string} firstName - First name
   * @param {string} lastName - Last name
   * @returns {string} - Sanitized full name
   */
  sanitizeName(firstName, lastName) {
    const first = (firstName || "").trim();
    const last = (lastName || "").trim();
    
    if (!first && !last) {
      return "Customer";
    }
    
    if (!first) return last;
    if (!last) return first;
    
    return `${first} ${last}`;
  }

  /**
   * Verify WhatsApp webhook
   * @param {string} mode - Verification mode
   * @param {string} token - Verification token
   * @param {string} challenge - Challenge string
   * @returns {string|false} - Challenge response or false
   */
  verifyWebhook(mode, token, challenge) {
    return this.whatsapp.verifyWebhook(mode, token, challenge);
  }
}

// Export for use in Node.js or browser
if (typeof module !== "undefined" && module.exports) {
  module.exports = SalonChatbot;
} else if (typeof window !== "undefined") {
  window.SalonChatbot = SalonChatbot;
}


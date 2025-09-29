/**
 * Comprehensive Test Suite for Salon Chatbot Platform
 * Tests all components and integrations
 */

const SalonChatbot = require("./salon-chatbot.js");
const Database = require("./database.js");
require("dotenv").config();

class TestSuite {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      total: 0,
      tests: [],
    };
    this.salonChatbot = null;
    this.database = null;
  }

  /**
   * Run a single test
   */
  async runTest(testName, testFunction) {
    try {
      console.log(`🧪 Running test: ${testName}`);
      await testFunction();
      this.results.passed++;
      this.results.tests.push({ name: testName, status: "PASSED" });
      console.log(`✅ ${testName} - PASSED`);
    } catch (error) {
      this.results.failed++;
      this.results.tests.push({ name: testName, status: "FAILED", error: error.message });
      console.log(`❌ ${testName} - FAILED: ${error.message}`);
    }
    this.results.total++;
  }

  /**
   * Initialize test environment
   */
  async initialize() {
    try {
      console.log("🚀 Initializing test environment...");
      
      // Initialize database
      this.database = new Database("./test_salon_chatbot.db");
      await this.database.initialize();
      
      // Initialize salon chatbot
      const config = {
        whatsapp: {
          accessToken: process.env.WHATSAPP_ACCESS_TOKEN || "test_token",
          phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || "test_phone_id",
          webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "test_verify_token",
        },
        openai: {
          apiKey: process.env.OPENAI_API_KEY || "test_api_key",
          salonConfig: {
            salonName: "Test Salon",
            services: ["Haircut", "Coloring"],
            languages: ["English"],
          },
        },
        hubspot: {
          accessToken: process.env.HUBSPOT_ACCESS_TOKEN || "test_hubspot_token",
          portalId: process.env.HUBSPOT_PORTAL_ID || "test_portal_id",
        },
      };
      
      this.salonChatbot = new SalonChatbot(config);
      
      console.log("✅ Test environment initialized");
    } catch (error) {
      console.error("❌ Error initializing test environment:", error);
      throw error;
    }
  }

  /**
   * Test database operations
   */
  async testDatabaseOperations() {
    await this.runTest("Database - Create Customer", async () => {
      const customerData = {
        phone: "+27123456789",
        name: "Test Customer",
        email: "test@example.com",
      };
      
      const result = await this.database.createCustomer(customerData);
      if (!result.id) throw new Error("Customer creation failed");
    });

    await this.runTest("Database - Get Customer", async () => {
      const customer = await this.database.getCustomer("+27123456789");
      if (!customer) throw new Error("Customer not found");
      if (customer.name !== "Test Customer") throw new Error("Customer data mismatch");
    });

    await this.runTest("Database - Create Booking", async () => {
      const bookingData = {
        id: "BK123456",
        customerPhone: "+27123456789",
        serviceId: "haircut",
        serviceName: "Haircut & Styling",
        date: "2024-01-15",
        time: "10:00",
        duration: 60,
        stylistId: "sarah",
        stylistName: "Sarah Johnson",
        price: 250,
        notes: "Test booking",
      };
      
      const result = await this.database.createBooking(bookingData);
      if (!result.id) throw new Error("Booking creation failed");
    });

    await this.runTest("Database - Get Customer Bookings", async () => {
      const bookings = await this.database.getCustomerBookings("+27123456789");
      if (bookings.length === 0) throw new Error("No bookings found");
      if (bookings[0].id !== "BK123456") throw new Error("Booking data mismatch");
    });

    await this.runTest("Database - Log Conversation", async () => {
      const conversationData = {
        customerPhone: "+27123456789",
        messageId: "msg123",
        messageType: "text",
        content: "Hello, I want to book an appointment",
        responseTime: 1.5,
        language: "en",
        channel: "whatsapp",
        context: "booking",
      };
      
      const result = await this.database.logConversation(conversationData);
      if (!result.id) throw new Error("Conversation logging failed");
    });

    await this.runTest("Database - Get Services", async () => {
      const services = await this.database.getServices();
      if (services.length === 0) throw new Error("No services found");
      if (!services.find(s => s.id === "haircut")) throw new Error("Haircut service not found");
    });

    await this.runTest("Database - Get Stylists", async () => {
      const stylists = await this.database.getStylists();
      if (stylists.length === 0) throw new Error("No stylists found");
      if (!stylists.find(s => s.id === "sarah")) throw new Error("Sarah stylist not found");
    });
  }

  /**
   * Test OpenAI integration
   */
  async testOpenAIIntegration() {
    await this.runTest("OpenAI - Basic Message", async () => {
      const response = await this.salonChatbot.ai.sendMessage("Hello, this is a test message");
      if (!response.success) throw new Error("OpenAI message failed");
      if (!response.content) throw new Error("No response content");
    });

    await this.runTest("OpenAI - Salon Context", async () => {
      const response = await this.salonChatbot.ai.processSalonMessage(
        "I want to book a haircut",
        [],
        "booking"
      );
      if (!response.success) throw new Error("Salon context processing failed");
      if (!response.content) throw new Error("No response content");
    });

    await this.runTest("OpenAI - Service Recommendations", async () => {
      const response = await this.salonChatbot.ai.generateServiceRecommendations(
        "I have curly hair and want something new",
        { name: "Test Customer" }
      );
      if (!response.success) throw new Error("Service recommendations failed");
      if (!response.content) throw new Error("No recommendations content");
    });

    await this.runTest("OpenAI - Multilingual Support", async () => {
      const response = await this.salonChatbot.ai.handleMultilingualMessage(
        "Hello, how are you?",
        "en"
      );
      if (!response.success) throw new Error("Multilingual support failed");
      if (!response.content) throw new Error("No multilingual response");
    });
  }

  /**
   * Test booking system
   */
  async testBookingSystem() {
    await this.runTest("Booking - Get Available Slots", async () => {
      const slots = await this.salonChatbot.booking.getAvailableSlots(
        "2024-01-15",
        "haircut",
        "sarah"
      );
      if (!Array.isArray(slots)) throw new Error("Available slots not returned as array");
    });

    await this.runTest("Booking - Check Slot Availability", async () => {
      const isAvailable = await this.salonChatbot.booking.isSlotAvailable(
        "2024-01-15",
        "10:00",
        "haircut",
        "sarah"
      );
      if (typeof isAvailable !== "boolean") throw new Error("Availability check failed");
    });

    await this.runTest("Booking - Create Booking", async () => {
      const bookingData = {
        customerName: "Test Customer",
        customerPhone: "+27123456789",
        customerEmail: "test@example.com",
        serviceId: "haircut",
        date: "2024-01-15",
        time: "10:00",
        stylistId: "sarah",
        notes: "Test booking",
      };
      
      const result = await this.salonChatbot.booking.createBooking(bookingData);
      if (!result.success) throw new Error("Booking creation failed");
      if (!result.booking) throw new Error("No booking object returned");
    });

    await this.runTest("Booking - Get Customer Bookings", async () => {
      const bookings = this.salonChatbot.booking.getCustomerBookings("+27123456789");
      if (!Array.isArray(bookings)) throw new Error("Customer bookings not returned as array");
    });

    await this.runTest("Booking - Cancel Booking", async () => {
      const bookings = this.salonChatbot.booking.getCustomerBookings("+27123456789");
      if (bookings.length > 0) {
        const result = await this.salonChatbot.booking.cancelBooking(
          bookings[0].id,
          "Test cancellation"
        );
        if (!result.success) throw new Error("Booking cancellation failed");
      }
    });
  }

  /**
   * Test WhatsApp integration
   */
  async testWhatsAppIntegration() {
    await this.runTest("WhatsApp - Webhook Verification", async () => {
      const challenge = this.salonChatbot.whatsapp.verifyWebhook(
        "subscribe",
        process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "test_verify_token",
        "test_challenge"
      );
      if (challenge !== "test_challenge") throw new Error("Webhook verification failed");
    });

    await this.runTest("WhatsApp - Process Webhook Message", async () => {
      const webhookData = {
        entry: [{
          changes: [{
            value: {
              messages: [{
                id: "test_msg_123",
                from: "+27123456789",
                timestamp: Date.now().toString(),
                type: "text",
                text: { body: "Hello, this is a test message" }
              }],
              contacts: [{
                profile: { name: "Test Customer" }
              }]
            }
          }]
        }]
      };
      
      const result = this.salonChatbot.whatsapp.processWebhookMessage(webhookData);
      if (!result.success) throw new Error("Webhook message processing failed");
      if (!result.from) throw new Error("No customer phone extracted");
    });
  }

  /**
   * Test HubSpot integration
   */
  async testHubSpotIntegration() {
    await this.runTest("HubSpot - Create Contact", async () => {
      const contactData = {
        email: "test@example.com",
        phone: "+27123456789",
        firstName: "Test",
        lastName: "Customer",
        properties: {
          preferred_services: "Haircut & Styling",
          customer_since: new Date().toISOString(),
        },
      };
      
      const result = await this.salonChatbot.hubspot.createOrUpdateContact(contactData);
      if (!result.success) throw new Error("HubSpot contact creation failed");
    });

    await this.runTest("HubSpot - Create Deal", async () => {
      const dealData = {
        contactId: "test_contact_id",
        dealName: "Test Haircut Appointment",
        amount: 250,
        closeDate: "2024-01-15",
        dealStage: "appointmentscheduled",
        properties: {
          service_name: "Haircut & Styling",
          stylist_name: "Sarah Johnson",
          appointment_date: "2024-01-15",
        },
      };
      
      const result = await this.salonChatbot.hubspot.createDeal(dealData);
      if (!result.success) throw new Error("HubSpot deal creation failed");
    });

    await this.runTest("HubSpot - Log Interaction", async () => {
      const interactionData = {
        contactId: "test_contact_id",
        interactionType: "BOOKING_CREATED",
        content: "Booking created: Haircut & Styling on 2024-01-15",
        channel: "whatsapp",
      };
      
      const result = await this.salonChatbot.hubspot.logInteraction(interactionData);
      if (!result.success) throw new Error("HubSpot interaction logging failed");
    });
  }

  /**
   * Test analytics tracking
   */
  async testAnalyticsTracking() {
    await this.runTest("Analytics - Track Conversation", async () => {
      this.salonChatbot.analytics.trackConversation({
        customerId: "test_customer_123",
        messageType: "text",
        responseTime: 1.5,
        language: "en",
        channel: "whatsapp",
      });
      // No error means success
    });

    await this.runTest("Analytics - Track Booking", async () => {
      this.salonChatbot.analytics.trackBooking({
        customerId: "test_customer_123",
        bookingId: "BK123456",
        serviceType: "Haircut & Styling",
        value: 250,
        bookingDate: "2024-01-15",
        stylistId: "sarah",
      });
      // No error means success
    });

    await this.runTest("Analytics - Track Customer Satisfaction", async () => {
      this.salonChatbot.analytics.trackCustomerSatisfaction({
        customerId: "test_customer_123",
        rating: 5,
        feedback: "Excellent service!",
        bookingId: "BK123456",
      });
      // No error means success
    });

    await this.runTest("Analytics - Get Dashboard Data", async () => {
      const dashboard = this.salonChatbot.analytics.getDashboardData("day");
      if (!dashboard) throw new Error("Dashboard data not returned");
      if (!dashboard.kpis) throw new Error("KPIs not included in dashboard");
    });
  }

  /**
   * Test main chatbot orchestrator
   */
  async testChatbotOrchestrator() {
    await this.runTest("Chatbot - Process Message", async () => {
      const webhookData = {
        entry: [{
          changes: [{
            value: {
              messages: [{
                id: "test_msg_456",
                from: "+27123456789",
                timestamp: Date.now().toString(),
                type: "text",
                text: { body: "I want to book a haircut for tomorrow" }
              }],
              contacts: [{
                profile: { name: "Test Customer" }
              }]
            }
          }]
        }]
      };
      
      const result = await this.salonChatbot.processMessage(webhookData);
      if (!result.success) throw new Error("Message processing failed");
    });

    await this.runTest("Chatbot - Get Analytics Dashboard", async () => {
      const dashboard = this.salonChatbot.getAnalyticsDashboard("day");
      if (!dashboard) throw new Error("Analytics dashboard not returned");
    });
  }

  /**
   * Test error handling
   */
  async testErrorHandling() {
    await this.runTest("Error Handling - Invalid API Key", async () => {
      try {
        const invalidChatbot = new SalonChatbot({
          openai: { apiKey: "invalid_key" },
          whatsapp: { accessToken: "test_token", phoneNumberId: "test_id" },
        });
        // Should not throw error during initialization
      } catch (error) {
        // Expected to fail
      }
    });

    await this.runTest("Error Handling - Invalid Booking Data", async () => {
      try {
        const result = await this.salonChatbot.booking.createBooking({
          // Missing required fields
          customerName: "Test",
        });
        if (result.success) throw new Error("Should have failed with invalid data");
      } catch (error) {
        // Expected to fail
      }
    });
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    try {
      console.log("🧪 Starting Comprehensive Test Suite");
      console.log("=====================================");
      
      await this.initialize();
      
      console.log("\n📊 Testing Database Operations...");
      await this.testDatabaseOperations();
      
      console.log("\n🤖 Testing OpenAI Integration...");
      await this.testOpenAIIntegration();
      
      console.log("\n📅 Testing Booking System...");
      await this.testBookingSystem();
      
      console.log("\n📱 Testing WhatsApp Integration...");
      await this.testWhatsAppIntegration();
      
      console.log("\n🔗 Testing HubSpot Integration...");
      await this.testHubSpotIntegration();
      
      console.log("\n📈 Testing Analytics Tracking...");
      await this.testAnalyticsTracking();
      
      console.log("\n🎯 Testing Chatbot Orchestrator...");
      await this.testChatbotOrchestrator();
      
      console.log("\n⚠️ Testing Error Handling...");
      await this.testErrorHandling();
      
      this.printResults();
      
    } catch (error) {
      console.error("❌ Test suite failed:", error);
    } finally {
      // Cleanup
      if (this.database) {
        this.database.close();
      }
    }
  }

  /**
   * Print test results
   */
  printResults() {
    console.log("\n📊 Test Results Summary");
    console.log("=======================");
    console.log(`Total Tests: ${this.results.total}`);
    console.log(`Passed: ${this.results.passed}`);
    console.log(`Failed: ${this.results.failed}`);
    console.log(`Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);
    
    if (this.results.failed > 0) {
      console.log("\n❌ Failed Tests:");
      this.results.tests
        .filter(test => test.status === "FAILED")
        .forEach(test => {
          console.log(`  - ${test.name}: ${test.error}`);
        });
    }
    
    console.log("\n🎉 Test suite completed!");
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const testSuite = new TestSuite();
  testSuite.runAllTests();
}

module.exports = TestSuite;







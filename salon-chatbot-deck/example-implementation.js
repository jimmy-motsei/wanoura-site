/**
 * Example Implementation of Salon Chatbot
 * Demonstrates how to use the salon chatbot platform
 */

const SalonChatbot = require("./salon-chatbot.js");
require("dotenv").config();

// Example configuration
const salonConfig = {
  // WhatsApp configuration
  whatsapp: {
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN,
  },

  // OpenAI configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    salonConfig: {
      salonName: "Maru Salon",
      services: [
        "Haircut & Styling",
        "Hair Coloring",
        "Highlights",
        "Balayage",
        "Hair Treatment",
        "Bridal Hair",
        "Men's Grooming",
      ],
      languages: ["English", "Afrikaans"],
      businessHours: "Mon-Fri: 9AM-6PM, Sat: 9AM-4PM",
      location: "Cape Town, South Africa",
    },
  },

  // Booking configuration
  booking: {
    businessHours: {
      monday: { start: "09:00", end: "18:00" },
      tuesday: { start: "09:00", end: "18:00" },
      wednesday: { start: "09:00", end: "18:00" },
      thursday: { start: "09:00", end: "18:00" },
      friday: { start: "09:00", end: "18:00" },
      saturday: { start: "09:00", end: "16:00" },
      sunday: { start: "closed", end: "closed" },
    },
    services: [
      { id: "haircut", name: "Haircut & Styling", duration: 60, price: 250 },
      { id: "coloring", name: "Hair Coloring", duration: 120, price: 450 },
      { id: "highlights", name: "Highlights", duration: 180, price: 600 },
      { id: "balayage", name: "Balayage", duration: 240, price: 800 },
      { id: "treatment", name: "Hair Treatment", duration: 90, price: 300 },
      { id: "bridal", name: "Bridal Hair", duration: 180, price: 1200 },
      { id: "mens", name: "Men's Grooming", duration: 45, price: 180 },
    ],
    stylists: [
      {
        id: "sarah",
        name: "Sarah Johnson",
        specialties: ["haircut", "coloring", "highlights"],
      },
      {
        id: "mike",
        name: "Mike Chen",
        specialties: ["haircut", "mens", "treatment"],
      },
      {
        id: "lisa",
        name: "Lisa Williams",
        specialties: ["balayage", "bridal", "coloring"],
      },
      {
        id: "david",
        name: "David Brown",
        specialties: ["haircut", "mens", "treatment"],
      },
    ],
  },

  // HubSpot configuration
  hubspot: {
    accessToken: process.env.HUBSPOT_ACCESS_TOKEN,
    portalId: process.env.HUBSPOT_PORTAL_ID,
  },

  // Analytics configuration
  analytics: {
    trackConversations: true,
    trackBookings: true,
    trackRevenue: true,
    trackCustomerSatisfaction: true,
    trackPerformance: true,
  },
};

// Initialize salon chatbot
let salonChatbot;

async function initializeSalonChatbot() {
  try {
    console.log("🚀 Initializing Salon Chatbot...");

    salonChatbot = new SalonChatbot(salonConfig);

    console.log("✅ Salon Chatbot initialized successfully!");
    console.log("📱 WhatsApp integration ready");
    console.log("🤖 AI assistant ready");
    console.log("📅 Booking system ready");
    console.log("📊 Analytics tracking ready");
    console.log("🔗 HubSpot integration ready");

    return salonChatbot;
  } catch (error) {
    console.error("❌ Error initializing salon chatbot:", error);
    throw error;
  }
}

// Example: Process incoming WhatsApp message
async function processIncomingMessage(webhookData) {
  try {
    console.log("📨 Processing incoming message...");

    const result = await salonChatbot.processMessage(webhookData);

    if (result.success) {
      console.log("✅ Message processed successfully");
      console.log("🤖 AI Response:", result.aiResponse);
      console.log("🎯 Actions:", result.actions);
    } else {
      console.error("❌ Error processing message:", result.error);
    }

    return result;
  } catch (error) {
    console.error("❌ Error processing message:", error);
    return { success: false, error: error.message };
  }
}

// Example: Get analytics dashboard
async function getAnalyticsDashboard(period = "day") {
  try {
    console.log(`📊 Getting analytics dashboard for ${period}...`);

    const dashboard = salonChatbot.getAnalyticsDashboard(period);

    console.log("📈 Analytics Dashboard:");
    console.log("KPIs:", dashboard.kpis);
    console.log("Conversations:", dashboard.conversations);
    console.log("Bookings:", dashboard.bookings);
    console.log("Satisfaction:", dashboard.satisfaction);

    return dashboard;
  } catch (error) {
    console.error("❌ Error getting analytics dashboard:", error);
    return { error: error.message };
  }
}

// Example: Test booking flow
async function testBookingFlow() {
  try {
    console.log("🧪 Testing booking flow...");

    // Simulate customer booking a haircut
    const mockWebhookData = {
      entry: [
        {
          changes: [
            {
              value: {
                messages: [
                  {
                    id: "test_message_123",
                    from: "+27123456789",
                    timestamp: Date.now().toString(),
                    type: "text",
                    text: {
                      body: "I want to book a haircut for tomorrow afternoon",
                    },
                  },
                ],
                contacts: [
                  {
                    profile: { name: "John Doe" },
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    const result = await processIncomingMessage(mockWebhookData);

    if (result.success) {
      console.log("✅ Booking flow test completed");
      console.log("📝 Result:", result);
    } else {
      console.error("❌ Booking flow test failed:", result.error);
    }

    return result;
  } catch (error) {
    console.error("❌ Error testing booking flow:", error);
    return { success: false, error: error.message };
  }
}

// Example: Test service recommendations
async function testServiceRecommendations() {
  try {
    console.log("🧪 Testing service recommendations...");

    const customerMessage = "I have curly hair and want something new";
    const customerProfile = {
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+27123456789",
    };

    const recommendations =
      await salonChatbot.ai.generateServiceRecommendations(
        customerMessage,
        customerProfile
      );

    if (recommendations.success) {
      console.log("✅ Service recommendations generated:");
      console.log("💡 Recommendations:", recommendations.content);
    } else {
      console.error(
        "❌ Error generating recommendations:",
        recommendations.error
      );
    }

    return recommendations;
  } catch (error) {
    console.error("❌ Error testing service recommendations:", error);
    return { success: false, error: error.message };
  }
}

// Example: Test multilingual support
async function testMultilingualSupport() {
  try {
    console.log("🧪 Testing multilingual support...");

    const afrikaansMessage = "Ek wil 'n afspraak maak vir more";
    const detectedLanguage = "af";

    const response = await salonChatbot.ai.handleMultilingualMessage(
      afrikaansMessage,
      detectedLanguage
    );

    if (response.success) {
      console.log("✅ Multilingual support test completed");
      console.log("🌍 Response:", response.content);
      console.log("🔤 Language:", response.detectedLanguage);
    } else {
      console.error("❌ Error testing multilingual support:", response.error);
    }

    return response;
  } catch (error) {
    console.error("❌ Error testing multilingual support:", error);
    return { success: false, error: error.message };
  }
}

// Example: Test analytics tracking
async function testAnalyticsTracking() {
  try {
    console.log("🧪 Testing analytics tracking...");

    // Track a conversation
    salonChatbot.analytics.trackConversation({
      customerId: "test_customer_123",
      messageType: "text",
      responseTime: 1.5,
      language: "en",
      channel: "whatsapp",
    });

    // Track a booking
    salonChatbot.analytics.trackBooking({
      customerId: "test_customer_123",
      bookingId: "BK123456",
      serviceType: "Haircut & Styling",
      value: 250,
      bookingDate: "2024-01-15",
      stylistId: "sarah",
    });

    // Track customer satisfaction
    salonChatbot.analytics.trackCustomerSatisfaction({
      customerId: "test_customer_123",
      rating: 5,
      feedback: "Excellent service! Very happy with my haircut.",
      bookingId: "BK123456",
    });

    // Get analytics dashboard
    const dashboard = await getAnalyticsDashboard("day");

    console.log("✅ Analytics tracking test completed");
    console.log("📊 Dashboard:", dashboard);

    return dashboard;
  } catch (error) {
    console.error("❌ Error testing analytics tracking:", error);
    return { success: false, error: error.message };
  }
}

// Example: Test HubSpot integration
async function testHubSpotIntegration() {
  try {
    console.log("🧪 Testing HubSpot integration...");

    // Create a test contact
    const contactResult = await salonChatbot.hubspot.createOrUpdateContact({
      email: "test@example.com",
      phone: "+27123456789",
      firstName: "Test",
      lastName: "Customer",
      properties: {
        preferred_services: "Haircut & Styling",
        customer_since: new Date().toISOString(),
      },
    });

    if (contactResult.success) {
      console.log("✅ Contact created successfully:", contactResult.contactId);

      // Create a test deal
      const dealResult = await salonChatbot.hubspot.createDeal({
        contactId: contactResult.contactId,
        dealName: "Test Haircut Appointment",
        amount: 250,
        closeDate: "2024-01-15",
        dealStage: "appointmentscheduled",
        properties: {
          service_name: "Haircut & Styling",
          stylist_name: "Sarah Johnson",
          appointment_date: "2024-01-15",
        },
      });

      if (dealResult.success) {
        console.log("✅ Deal created successfully:", dealResult.dealId);
      } else {
        console.error("❌ Error creating deal:", dealResult.error);
      }
    } else {
      console.error("❌ Error creating contact:", contactResult.error);
    }

    return { contactResult, dealResult };
  } catch (error) {
    console.error("❌ Error testing HubSpot integration:", error);
    return { success: false, error: error.message };
  }
}

// Example: Test WhatsApp integration
async function testWhatsAppIntegration() {
  try {
    console.log("🧪 Testing WhatsApp integration...");

    // Send a test message
    const messageResult = await salonChatbot.whatsapp.sendTextMessage(
      "+27123456789",
      "Hello! This is a test message from Maru Salon chatbot. How can I help you today?"
    );

    if (messageResult.success) {
      console.log(
        "✅ WhatsApp message sent successfully:",
        messageResult.messageId
      );
    } else {
      console.error("❌ Error sending WhatsApp message:", messageResult.error);
    }

    return messageResult;
  } catch (error) {
    console.error("❌ Error testing WhatsApp integration:", error);
    return { success: false, error: error.message };
  }
}

// Example: Test booking system
async function testBookingSystem() {
  try {
    console.log("🧪 Testing booking system...");

    // Get available slots
    const availableSlots = await salonChatbot.booking.getAvailableSlots(
      "2024-01-15",
      "haircut",
      "sarah"
    );

    console.log("📅 Available slots:", availableSlots);

    // Create a test booking
    const bookingResult = await salonChatbot.booking.createBooking({
      customerName: "Test Customer",
      customerPhone: "+27123456789",
      customerEmail: "test@example.com",
      serviceId: "haircut",
      date: "2024-01-15",
      time: availableSlots[0]?.time || "10:00",
      stylistId: "sarah",
      notes: "Test booking",
    });

    if (bookingResult.success) {
      console.log("✅ Booking created successfully:", bookingResult.booking);
    } else {
      console.error("❌ Error creating booking:", bookingResult.error);
    }

    return bookingResult;
  } catch (error) {
    console.error("❌ Error testing booking system:", error);
    return { success: false, error: error.message };
  }
}

// Main example function
async function runExamples() {
  try {
    console.log("🎯 Salon Chatbot Platform Examples");
    console.log("===================================");

    // Initialize chatbot
    await initializeSalonChatbot();

    console.log("\n📱 Testing WhatsApp Integration...");
    await testWhatsAppIntegration();

    console.log("\n📅 Testing Booking System...");
    await testBookingSystem();

    console.log("\n🤖 Testing Service Recommendations...");
    await testServiceRecommendations();

    console.log("\n🌍 Testing Multilingual Support...");
    await testMultilingualSupport();

    console.log("\n📊 Testing Analytics Tracking...");
    await testAnalyticsTracking();

    console.log("\n🔗 Testing HubSpot Integration...");
    await testHubSpotIntegration();

    console.log("\n🧪 Testing Complete Booking Flow...");
    await testBookingFlow();

    console.log("\n🎉 All examples completed successfully!");
  } catch (error) {
    console.error("❌ Error running examples:", error);
  }
}

// Export functions for use in other modules
module.exports = {
  initializeSalonChatbot,
  processIncomingMessage,
  getAnalyticsDashboard,
  testBookingFlow,
  testServiceRecommendations,
  testMultilingualSupport,
  testAnalyticsTracking,
  testHubSpotIntegration,
  testWhatsAppIntegration,
  testBookingSystem,
  runExamples,
};

// Run examples if this file is executed directly
if (require.main === module) {
  runExamples();
}


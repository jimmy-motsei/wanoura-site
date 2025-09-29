/**
 * Salon Chatbot Server
 * Express.js server for handling WhatsApp webhooks and API endpoints
 */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const SalonChatbot = require("./salon-chatbot.js");

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize salon chatbot
let salonChatbot;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json({ limit: "10mb" })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);

// Initialize chatbot
async function initializeChatbot() {
  try {
    console.log("🚀 Initializing Salon Chatbot...");
    
    const config = {
      whatsapp: {
        accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
        phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
        webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN,
      },
      openai: {
        apiKey: process.env.OPENAI_API_KEY,
        salonConfig: {
          salonName: process.env.SALON_NAME || "Maru Salon",
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
          location: process.env.SALON_LOCATION || "Cape Town, South Africa",
        },
      },
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
          { id: "sarah", name: "Sarah Johnson", specialties: ["haircut", "coloring", "highlights"] },
          { id: "mike", name: "Mike Chen", specialties: ["haircut", "mens", "treatment"] },
          { id: "lisa", name: "Lisa Williams", specialties: ["balayage", "bridal", "coloring"] },
          { id: "david", name: "David Brown", specialties: ["haircut", "mens", "treatment"] },
        ],
      },
      hubspot: {
        accessToken: process.env.HUBSPOT_ACCESS_TOKEN,
        portalId: process.env.HUBSPOT_PORTAL_ID,
      },
      analytics: {
        trackConversations: true,
        trackBookings: true,
        trackRevenue: true,
        trackCustomerSatisfaction: true,
        trackPerformance: true,
      },
    };

    salonChatbot = new SalonChatbot(config);
    console.log("✅ Salon Chatbot initialized successfully!");
    
    return salonChatbot;
  } catch (error) {
    console.error("❌ Error initializing salon chatbot:", error);
    throw error;
  }
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: "1.0.0",
  });
});

// WhatsApp webhook verification
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    console.log("✅ WhatsApp webhook verified");
    res.status(200).send(challenge);
  } else {
    console.log("❌ WhatsApp webhook verification failed");
    res.status(403).send("Forbidden");
  }
});

// WhatsApp webhook handler
app.post("/webhook", async (req, res) => {
  try {
    console.log("📨 Received WhatsApp webhook:", JSON.stringify(req.body, null, 2));
    
    if (!salonChatbot) {
      console.error("❌ Salon chatbot not initialized");
      return res.status(500).json({ error: "Chatbot not initialized" });
    }

    // Process the message
    const result = await salonChatbot.processMessage(req.body);
    
    if (result.success) {
      console.log("✅ Message processed successfully");
      console.log("🤖 AI Response:", result.aiResponse);
      console.log("🎯 Actions:", result.actions);
    } else {
      console.error("❌ Error processing message:", result.error);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Error handling webhook:", error);
    res.status(500).json({ error: error.message });
  }
});

// Analytics endpoints
app.get("/api/analytics/:period", async (req, res) => {
  try {
    const { period } = req.params;
    const validPeriods = ["day", "week", "month"];
    
    if (!validPeriods.includes(period)) {
      return res.status(400).json({ error: "Invalid period. Use: day, week, or month" });
    }

    if (!salonChatbot) {
      return res.status(500).json({ error: "Chatbot not initialized" });
    }

    const dashboard = salonChatbot.getAnalyticsDashboard(period);
    res.json(dashboard);
  } catch (error) {
    console.error("❌ Error getting analytics:", error);
    res.status(500).json({ error: error.message });
  }
});

// Booking endpoints
app.get("/api/bookings/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;
    
    if (!salonChatbot) {
      return res.status(500).json({ error: "Chatbot not initialized" });
    }

    const bookings = salonChatbot.booking.getCustomerBookings(customerId);
    res.json({ success: true, bookings });
  } catch (error) {
    console.error("❌ Error getting bookings:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/bookings", async (req, res) => {
  try {
    const bookingData = req.body;
    
    if (!salonChatbot) {
      return res.status(500).json({ error: "Chatbot not initialized" });
    }

    const result = await salonChatbot.booking.createBooking(bookingData);
    res.json(result);
  } catch (error) {
    console.error("❌ Error creating booking:", error);
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/bookings/:bookingId/reschedule", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { newDate, newTime } = req.body;
    
    if (!salonChatbot) {
      return res.status(500).json({ error: "Chatbot not initialized" });
    }

    const result = await salonChatbot.booking.rescheduleBooking(bookingId, newDate, newTime);
    res.json(result);
  } catch (error) {
    console.error("❌ Error rescheduling booking:", error);
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/bookings/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;
    
    if (!salonChatbot) {
      return res.status(500).json({ error: "Chatbot not initialized" });
    }

    const result = await salonChatbot.booking.cancelBooking(bookingId, reason);
    res.json(result);
  } catch (error) {
    console.error("❌ Error cancelling booking:", error);
    res.status(500).json({ error: error.message });
  }
});

// Availability endpoints
app.get("/api/availability", async (req, res) => {
  try {
    const { date, serviceId, stylistId } = req.query;
    
    if (!salonChatbot) {
      return res.status(500).json({ error: "Chatbot not initialized" });
    }

    const slots = await salonChatbot.booking.getAvailableSlots(date, serviceId, stylistId);
    res.json({ success: true, slots });
  } catch (error) {
    console.error("❌ Error getting availability:", error);
    res.status(500).json({ error: error.message });
  }
});

// Services endpoints
app.get("/api/services", async (req, res) => {
  try {
    if (!salonChatbot) {
      return res.status(500).json({ error: "Chatbot not initialized" });
    }

    const services = salonChatbot.booking.config.services;
    res.json({ success: true, services });
  } catch (error) {
    console.error("❌ Error getting services:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/stylists", async (req, res) => {
  try {
    if (!salonChatbot) {
      return res.status(500).json({ error: "Chatbot not initialized" });
    }

    const stylists = salonChatbot.booking.config.stylists;
    res.json({ success: true, stylists });
  } catch (error) {
    console.error("❌ Error getting stylists:", error);
    res.status(500).json({ error: error.message });
  }
});

// Test endpoints
app.post("/api/test/message", async (req, res) => {
  try {
    const { message, customerId } = req.body;
    
    if (!salonChatbot) {
      return res.status(500).json({ error: "Chatbot not initialized" });
    }

    // Create mock webhook data
    const mockWebhookData = {
      entry: [{
        changes: [{
          value: {
            messages: [{
              id: `test_${Date.now()}`,
              from: customerId || "+27123456789",
              timestamp: Date.now().toString(),
              type: "text",
              text: { body: message }
            }],
            contacts: [{
              profile: { name: "Test Customer" }
            }]
          }
        }]
      }]
    };

    const result = await salonChatbot.processMessage(mockWebhookData);
    res.json(result);
  } catch (error) {
    console.error("❌ Error testing message:", error);
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Start server
async function startServer() {
  try {
    // Initialize chatbot
    await initializeChatbot();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Salon Chatbot Server running on port ${PORT}`);
      console.log(`📱 WhatsApp webhook: http://localhost:${PORT}/webhook`);
      console.log(`📊 Analytics API: http://localhost:${PORT}/api/analytics/day`);
      console.log(`🔧 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 API documentation available at /api endpoints`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down server gracefully...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Shutting down server gracefully...");
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;







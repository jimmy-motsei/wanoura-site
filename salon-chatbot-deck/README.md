# 🏗️ Salon Chatbot Platform

A comprehensive AI-powered chatbot platform for salon businesses, built with OpenAI GPT-5, WhatsApp Business API, HubSpot integration, and advanced analytics.

## 🎯 Overview

This platform implements the solution presented in your pitch deck, providing:

- **24/7 AI-powered customer service** with consistent, premium brand tone
- **Seamless booking system** with real-time availability and confirmation
- **Multilingual support** (English, Afrikaans, local languages)
- **HubSpot CRM integration** for lead capture and customer management
- **Advanced analytics** for CSAT, conversion, and performance tracking
- **WhatsApp Business API** for familiar customer communication

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy the example environment file and configure your API keys:

```bash
cp env.example .env
```

Edit `.env` with your credentials:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token

# HubSpot Integration
HUBSPOT_ACCESS_TOKEN=your_hubspot_access_token
HUBSPOT_PORTAL_ID=your_hubspot_portal_id
```

### 3. Run Examples

```bash
npm run example
```

## 📁 Project Structure

```
salon-chatbot-deck/
├── openai-client.js          # OpenAI GPT-5 integration
├── whatsapp-client.js        # WhatsApp Business API client
├── salon-ai-client.js        # Salon-specific AI prompts
├── booking-manager.js        # Appointment booking system
├── hubspot-client.js         # HubSpot CRM integration
├── analytics-tracker.js     # Analytics and KPI tracking
├── salon-chatbot.js         # Main orchestrator
├── example-implementation.js # Usage examples
├── test-openai.js           # OpenAI API testing
├── example-usage.js         # Basic usage examples
├── package.json             # Dependencies
├── env.example              # Environment template
└── README.md                # This file
```

## 🛠️ Core Components

### 1. OpenAI GPT-5 Integration (`openai-client.js`)

- **Purpose**: Core AI conversation handling
- **Features**: Message processing, conversation management, embeddings
- **Usage**: Direct API calls to OpenAI's GPT-5 model

### 2. WhatsApp Business API (`whatsapp-client.js`)

- **Purpose**: Customer communication via WhatsApp
- **Features**: Text messages, templates, interactive messages, webhooks
- **Usage**: Send/receive messages, handle customer interactions

### 3. Salon AI Client (`salon-ai-client.js`)

- **Purpose**: Salon-specific AI prompts and conversation flows
- **Features**: Service recommendations, multilingual support, appointment confirmations
- **Usage**: Enhanced AI responses tailored for salon business

### 4. Booking Manager (`booking-manager.js`)

- **Purpose**: Appointment scheduling and management
- **Features**: Availability checking, booking creation, rescheduling, cancellation
- **Usage**: Handle all appointment-related operations

### 5. HubSpot Integration (`hubspot-client.js`)

- **Purpose**: CRM data synchronization
- **Features**: Contact management, deal creation, ticket handling, activity logging
- **Usage**: Sync customer data and booking information

### 6. Analytics Tracker (`analytics-tracker.js`)

- **Purpose**: Performance monitoring and KPI tracking
- **Features**: Conversation analytics, booking metrics, customer satisfaction, performance tracking
- **Usage**: Monitor business performance and customer satisfaction

### 7. Main Orchestrator (`salon-chatbot.js`)

- **Purpose**: Coordinates all components
- **Features**: Message processing, conversation state management, action handling
- **Usage**: Main entry point for the chatbot platform

## 📊 Key Features

### 🤖 AI-Powered Conversations

- **24/7 availability** with consistent brand tone
- **Context-aware responses** based on conversation history
- **Multilingual support** for diverse customer base
- **Service recommendations** based on customer needs

### 📅 Appointment Management

- **Real-time availability** checking and booking
- **Automated confirmations** and reminders
- **Easy rescheduling** and cancellation
- **Stylist assignment** and specialization matching

### 📈 Analytics & Reporting

- **Conversion tracking** from inquiry to booking
- **Customer satisfaction** monitoring
- **Performance metrics** for staff and services
- **Revenue analytics** and reporting

### 🔗 CRM Integration

- **Automatic lead capture** from conversations
- **Customer profile** management
- **Deal tracking** for bookings
- **Activity logging** for customer interactions

## 🎯 Usage Examples

### Basic Chatbot Setup

```javascript
const SalonChatbot = require("./salon-chatbot.js");

const chatbot = new SalonChatbot({
  whatsapp: {
    accessToken: "your_whatsapp_token",
    phoneNumberId: "your_phone_number_id",
    webhookVerifyToken: "your_webhook_token",
  },
  openai: {
    apiKey: "your_openai_key",
    salonConfig: {
      salonName: "Maru Salon",
      services: ["Haircut", "Coloring", "Highlights"],
      languages: ["English", "Afrikaans"],
    },
  },
  hubspot: {
    accessToken: "your_hubspot_token",
    portalId: "your_portal_id",
  },
});
```

### Process Incoming Messages

```javascript
// Handle WhatsApp webhook
app.post("/webhook", async (req, res) => {
  const result = await chatbot.processMessage(req.body);
  res.status(200).send("OK");
});
```

### Get Analytics Dashboard

```javascript
// Get daily analytics
const dashboard = chatbot.getAnalyticsDashboard("day");
console.log("KPIs:", dashboard.kpis);
console.log("Bookings:", dashboard.bookings);
console.log("Satisfaction:", dashboard.satisfaction);
```

## 🔧 Configuration

### Salon Configuration

```javascript
const salonConfig = {
  salonName: "Maru Salon",
  services: [
    { id: "haircut", name: "Haircut & Styling", duration: 60, price: 250 },
    { id: "coloring", name: "Hair Coloring", duration: 120, price: 450 },
    // ... more services
  ],
  stylists: [
    {
      id: "sarah",
      name: "Sarah Johnson",
      specialties: ["haircut", "coloring"],
    },
    // ... more stylists
  ],
  businessHours: {
    monday: { start: "09:00", end: "18:00" },
    // ... other days
  },
};
```

### WhatsApp Configuration

```javascript
const whatsappConfig = {
  accessToken: "your_whatsapp_access_token",
  phoneNumberId: "your_phone_number_id",
  webhookVerifyToken: "your_webhook_verify_token",
};
```

### HubSpot Configuration

```javascript
const hubspotConfig = {
  accessToken: "your_hubspot_access_token",
  portalId: "your_hubspot_portal_id",
};
```

## 📱 WhatsApp Integration

### Webhook Setup

1. **Configure webhook URL** in WhatsApp Business API
2. **Set webhook events** to receive messages
3. **Verify webhook** with your verify token

### Message Types Supported

- **Text messages** for general conversation
- **Template messages** for confirmations and reminders
- **Interactive messages** for service selection
- **List messages** for appointment booking

## 🔗 HubSpot Integration

### Automatic Data Sync

- **Contact creation** from new customers
- **Deal creation** for bookings
- **Ticket creation** for escalations
- **Activity logging** for all interactions

### Custom Properties

- **Salon-specific fields** for services and preferences
- **Booking information** for appointment tracking
- **Customer journey** mapping

## 📊 Analytics Dashboard

### Key Metrics

- **Conversion Rate**: Inquiries to bookings
- **Average Order Value**: Revenue per booking
- **Customer Satisfaction**: Rating and feedback
- **Response Time**: AI response performance
- **Language Distribution**: Multilingual usage

### Performance Tracking

- **Stylist Performance**: Bookings and revenue per stylist
- **Service Popularity**: Most requested services
- **Peak Hours**: Busiest times for bookings
- **Customer Retention**: Repeat booking rates

## 🧪 Testing

### Run OpenAI Tests

```bash
npm test
```

### Run Examples

```bash
npm run example
```

### Test Individual Components

```javascript
// Test OpenAI integration
const { testOpenAIConnection } = require("./test-openai.js");
await testOpenAIConnection();

// Test WhatsApp integration
const { testWhatsAppIntegration } = require("./example-implementation.js");
await testWhatsAppIntegration();
```

## 🚀 Deployment

### Environment Variables

Ensure all required environment variables are set:

```env
OPENAI_API_KEY=your_openai_api_key
WHATSAPP_ACCESS_TOKEN=your_whatsapp_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_webhook_token
HUBSPOT_ACCESS_TOKEN=your_hubspot_token
HUBSPOT_PORTAL_ID=your_portal_id
```

### Webhook Configuration

1. **Set webhook URL** to your server endpoint
2. **Configure webhook events** for messages and status updates
3. **Verify webhook** with your verify token

### Server Setup

```javascript
const express = require("express");
const app = express();

app.use(express.json());

// WhatsApp webhook
app.post("/webhook", async (req, res) => {
  const result = await chatbot.processMessage(req.body);
  res.status(200).send("OK");
});

// Analytics endpoint
app.get("/analytics/:period", async (req, res) => {
  const dashboard = chatbot.getAnalyticsDashboard(req.params.period);
  res.json(dashboard);
});

app.listen(3000, () => {
  console.log("Salon Chatbot running on port 3000");
});
```

## 📈 Performance Optimization

### Caching

- **Customer profiles** cached in memory
- **Availability slots** cached for performance
- **Service information** cached for quick access

### Error Handling

- **Graceful degradation** when services are unavailable
- **Retry mechanisms** for failed API calls
- **Fallback responses** for AI failures

### Monitoring

- **Health checks** for all integrations
- **Performance metrics** for response times
- **Error tracking** for debugging

## 🔒 Security

### API Key Management

- **Environment variables** for sensitive data
- **Secure storage** of credentials
- **Access control** for webhook endpoints

### Data Privacy

- **Customer data** encryption
- **GDPR compliance** for data handling
- **Secure transmission** of messages

## 🛠️ Development

### Adding New Features

1. **Extend AI prompts** in `salon-ai-client.js`
2. **Add new services** in booking configuration
3. **Implement new analytics** in `analytics-tracker.js`
4. **Update conversation flows** in `salon-chatbot.js`

### Customization

- **Salon branding** in AI responses
- **Service offerings** in booking system
- **Analytics metrics** for business needs
- **Integration endpoints** for third-party services

## 📞 Support

For questions or issues:

1. **Check examples** in `example-implementation.js`
2. **Review documentation** in individual component files
3. **Test integrations** with provided test scripts
4. **Monitor logs** for error messages

## 🎉 Success Metrics

Based on your pitch deck, track these KPIs:

- **CSAT (Customer Satisfaction)**: Target >4.5/5
- **Containment Rate**: Target >80% AI resolution
- **Conversion Rate**: Target >25% inquiry to booking
- **Average Order Value**: Track revenue per booking
- **Time Saved**: Measure staff efficiency gains
- **Multilingual Support**: Track language usage

---

**Built with ❤️ for salon businesses**

_This platform implements the comprehensive solution presented in your pitch deck, providing AI-powered customer engagement, seamless booking, and data-driven growth for salon businesses._









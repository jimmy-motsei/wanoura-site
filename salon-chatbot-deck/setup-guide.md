# 🚀 Salon Chatbot Platform - Complete Setup Guide

This guide will help you build and deploy a working prototype of the salon chatbot platform with all necessary tools and integrations.

## 📋 Prerequisites

Before starting, ensure you have:

- **Node.js 16+** installed
- **npm 8+** installed
- **Git** for version control
- **API Keys** for integrations (see below)

## 🔑 Required API Keys

### 1. OpenAI API Key
- Visit: https://platform.openai.com/api-keys
- Create a new API key
- Note: GPT-5 may not be available yet, use GPT-4 as fallback

### 2. WhatsApp Business API
- Visit: https://developers.facebook.com/
- Create a WhatsApp Business API app
- Get: Access Token, Phone Number ID, Webhook Verify Token

### 3. HubSpot Integration
- Visit: https://developers.hubspot.com/
- Create a private app
- Get: Access Token, Portal ID

## 🛠️ Installation Steps

### Step 1: Clone and Install Dependencies

```bash
# Navigate to your project directory
cd /Users/ramoloimotsei/projects/salon-chatbot-deck

# Install all dependencies
npm install

# Install additional dependencies for production
npm install sqlite3 express cors helmet express-rate-limit
```

### Step 2: Environment Configuration

```bash
# Copy environment template
cp env.example .env

# Edit .env file with your API keys
nano .env
```

Fill in your `.env` file:

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

# Salon Configuration
SALON_NAME=Maru Salon
SALON_LOCATION=Cape Town, South Africa
```

### Step 3: Test the Setup

```bash
# Test OpenAI integration
npm test

# Run example implementation
npm run example

# Run comprehensive test suite
node test-suite.js
```

### Step 4: Start the Server

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

## 🐳 Docker Deployment (Optional)

### Using Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f salon-chatbot

# Stop services
docker-compose down
```

### Using Docker Only

```bash
# Build the image
docker build -t salon-chatbot .

# Run the container
docker run -p 3000:3000 --env-file .env salon-chatbot
```

## 🌐 WhatsApp Webhook Setup

### 1. Configure Webhook URL

In your WhatsApp Business API settings:
- **Webhook URL**: `https://your-domain.com/webhook`
- **Verify Token**: Use the same token from your `.env` file
- **Webhook Fields**: Select `messages` and `message_status`

### 2. Test Webhook

```bash
# Test webhook verification
curl -X GET "https://your-domain.com/webhook?hub.mode=subscribe&hub.verify_token=your_verify_token&hub.challenge=test_challenge"

# Should return: test_challenge
```

## 📊 API Endpoints

Once running, your server provides these endpoints:

### Health Check
```bash
GET /health
```

### WhatsApp Webhook
```bash
GET /webhook  # Verification
POST /webhook # Message handling
```

### Analytics
```bash
GET /api/analytics/day
GET /api/analytics/week
GET /api/analytics/month
```

### Bookings
```bash
GET /api/bookings/:customerId
POST /api/bookings
PUT /api/bookings/:bookingId/reschedule
DELETE /api/bookings/:bookingId
```

### Services & Availability
```bash
GET /api/services
GET /api/stylists
GET /api/availability?date=2024-01-15&serviceId=haircut
```

### Testing
```bash
POST /api/test/message
# Body: { "message": "Hello", "customerId": "+27123456789" }
```

## 🧪 Testing Your Setup

### 1. Basic Functionality Test

```bash
# Test OpenAI connection
curl -X POST "http://localhost:3000/api/test/message" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, I want to book a haircut", "customerId": "+27123456789"}'
```

### 2. Analytics Dashboard Test

```bash
# Get daily analytics
curl "http://localhost:3000/api/analytics/day"
```

### 3. Booking System Test

```bash
# Get available slots
curl "http://localhost:3000/api/availability?date=2024-01-15&serviceId=haircut"

# Create a booking
curl -X POST "http://localhost:3000/api/bookings" \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Test Customer",
    "customerPhone": "+27123456789",
    "serviceId": "haircut",
    "date": "2024-01-15",
    "time": "10:00"
  }'
```

## 🚀 Production Deployment

### Option 1: Cloud Platforms

#### Heroku
```bash
# Install Heroku CLI
# Create Heroku app
heroku create your-salon-chatbot

# Set environment variables
heroku config:set OPENAI_API_KEY=your_key
heroku config:set WHATSAPP_ACCESS_TOKEN=your_token
# ... set all other variables

# Deploy
git push heroku main
```

#### Railway
```bash
# Connect GitHub repository
# Set environment variables in Railway dashboard
# Deploy automatically on push
```

#### DigitalOcean App Platform
```bash
# Create app from GitHub repository
# Set environment variables
# Deploy with automatic scaling
```

### Option 2: VPS Deployment

```bash
# On your VPS server
git clone your-repository
cd salon-chatbot-deck
npm install
npm start

# Use PM2 for process management
npm install -g pm2
pm2 start server.js --name salon-chatbot
pm2 startup
pm2 save
```

### Option 3: Docker Deployment

```bash
# Build and push to registry
docker build -t your-registry/salon-chatbot .
docker push your-registry/salon-chatbot

# Deploy to your server
docker run -d -p 3000:3000 --env-file .env your-registry/salon-chatbot
```

## 🔧 Configuration Options

### Salon Customization

Edit `server.js` to customize:

```javascript
const config = {
  // Salon information
  salonConfig: {
    salonName: "Your Salon Name",
    services: ["Your", "Custom", "Services"],
    languages: ["English", "Your", "Languages"],
    businessHours: "Your Business Hours",
    location: "Your Location",
  },
  
  // Booking system
  booking: {
    businessHours: {
      monday: { start: "09:00", end: "18:00" },
      // ... customize your hours
    },
    services: [
      { id: "service1", name: "Service Name", duration: 60, price: 250 },
      // ... add your services
    ],
    stylists: [
      { id: "stylist1", name: "Stylist Name", specialties: ["service1"] },
      // ... add your stylists
    ],
  },
};
```

### Database Configuration

The platform uses SQLite by default. For production, consider:

- **PostgreSQL** for better performance
- **MongoDB** for document storage
- **Redis** for caching

## 📈 Monitoring and Maintenance

### Health Monitoring

```bash
# Check server health
curl http://localhost:3000/health

# Monitor logs
tail -f logs/salon-chatbot.log
```

### Analytics Dashboard

Access your analytics at:
- `http://localhost:3000/api/analytics/day`
- `http://localhost:3000/api/analytics/week`
- `http://localhost:3000/api/analytics/month`

### Performance Optimization

1. **Enable caching** for frequently accessed data
2. **Use CDN** for static assets
3. **Implement rate limiting** for API endpoints
4. **Monitor memory usage** and optimize accordingly

## 🛡️ Security Considerations

### Environment Security

- Never commit `.env` files to version control
- Use strong, unique API keys
- Rotate keys regularly
- Implement proper access controls

### API Security

- Use HTTPS in production
- Implement rate limiting
- Validate all inputs
- Use proper error handling

### Data Protection

- Encrypt sensitive customer data
- Implement GDPR compliance
- Regular security audits
- Backup data regularly

## 🆘 Troubleshooting

### Common Issues

1. **OpenAI API Errors**
   - Check API key validity
   - Verify account has sufficient credits
   - Check rate limits

2. **WhatsApp Webhook Issues**
   - Verify webhook URL is accessible
   - Check verify token matches
   - Ensure HTTPS in production

3. **Database Connection Issues**
   - Check file permissions
   - Verify database path
   - Check disk space

4. **Memory Issues**
   - Monitor memory usage
   - Implement garbage collection
   - Optimize data structures

### Debug Mode

Enable debug logging:

```bash
# Set debug environment variable
export DEBUG=salon-chatbot:*

# Run with debug output
npm start
```

## 📞 Support

If you encounter issues:

1. Check the logs for error messages
2. Verify all API keys are correct
3. Test individual components
4. Review the test suite results
5. Check network connectivity

## 🎉 Success!

Once everything is set up, you should have:

- ✅ Working WhatsApp webhook
- ✅ AI-powered conversations
- ✅ Booking system
- ✅ Analytics tracking
- ✅ HubSpot integration
- ✅ Production-ready deployment

Your salon chatbot platform is now ready to handle customer inquiries, manage bookings, and provide analytics for business growth!

---

**Built with ❤️ for salon businesses**

*This platform implements the comprehensive solution from your pitch deck, providing AI-powered customer engagement, seamless booking, and data-driven growth.*







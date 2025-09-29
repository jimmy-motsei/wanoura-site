/**
 * Database Integration
 * Handles data persistence for the salon chatbot platform
 */

const sqlite3 = require("sqlite3").verbose();
const path = require("path");

class Database {
  constructor(dbPath = "./salon_chatbot.db") {
    this.dbPath = dbPath;
    this.db = null;
  }

  /**
   * Initialize database connection and create tables
   */
  async initialize() {
    try {
      this.db = new sqlite3.Database(this.dbPath);
      await this.createTables();
      console.log("✅ Database initialized successfully");
    } catch (error) {
      console.error("❌ Error initializing database:", error);
      throw error;
    }
  }

  /**
   * Create database tables
   */
  async createTables() {
    const tables = [
      // Customers table
      `CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone TEXT UNIQUE NOT NULL,
        name TEXT,
        email TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        hubspot_contact_id TEXT,
        preferred_services TEXT,
        total_appointments INTEGER DEFAULT 0,
        total_spent REAL DEFAULT 0,
        last_interaction DATETIME
      )`,

      // Bookings table
      `CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        customer_phone TEXT NOT NULL,
        service_id TEXT NOT NULL,
        service_name TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        duration INTEGER NOT NULL,
        stylist_id TEXT,
        stylist_name TEXT,
        price REAL NOT NULL,
        status TEXT DEFAULT 'confirmed',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_phone) REFERENCES customers (phone)
      )`,

      // Conversations table
      `CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_phone TEXT NOT NULL,
        message_id TEXT,
        message_type TEXT,
        content TEXT,
        response_time REAL,
        language TEXT,
        channel TEXT DEFAULT 'whatsapp',
        context TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_phone) REFERENCES customers (phone)
      )`,

      // Analytics table
      `CREATE TABLE IF NOT EXISTS analytics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_type TEXT NOT NULL,
        customer_phone TEXT,
        data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_phone) REFERENCES customers (phone)
      )`,

      // Services table
      `CREATE TABLE IF NOT EXISTS services (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        duration INTEGER NOT NULL,
        price REAL NOT NULL,
        description TEXT,
        active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Stylists table
      `CREATE TABLE IF NOT EXISTS stylists (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        specialties TEXT,
        active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Business hours table
      `CREATE TABLE IF NOT EXISTS business_hours (
        day TEXT PRIMARY KEY,
        start_time TEXT,
        end_time TEXT,
        is_closed BOOLEAN DEFAULT 0
      )`,
    ];

    for (const table of tables) {
      await this.runQuery(table);
    }

    // Insert default data
    await this.insertDefaultData();
  }

  /**
   * Insert default data
   */
  async insertDefaultData() {
    // Insert default services
    const services = [
      { id: "haircut", name: "Haircut & Styling", duration: 60, price: 250 },
      { id: "coloring", name: "Hair Coloring", duration: 120, price: 450 },
      { id: "highlights", name: "Highlights", duration: 180, price: 600 },
      { id: "balayage", name: "Balayage", duration: 240, price: 800 },
      { id: "treatment", name: "Hair Treatment", duration: 90, price: 300 },
      { id: "bridal", name: "Bridal Hair", duration: 180, price: 1200 },
      { id: "mens", name: "Men's Grooming", duration: 45, price: 180 },
    ];

    for (const service of services) {
      await this.runQuery(
        `INSERT OR IGNORE INTO services (id, name, duration, price) VALUES (?, ?, ?, ?)`,
        [service.id, service.name, service.duration, service.price]
      );
    }

    // Insert default stylists
    const stylists = [
      { id: "sarah", name: "Sarah Johnson", specialties: "haircut,coloring,highlights" },
      { id: "mike", name: "Mike Chen", specialties: "haircut,mens,treatment" },
      { id: "lisa", name: "Lisa Williams", specialties: "balayage,bridal,coloring" },
      { id: "david", name: "David Brown", specialties: "haircut,mens,treatment" },
    ];

    for (const stylist of stylists) {
      await this.runQuery(
        `INSERT OR IGNORE INTO stylists (id, name, specialties) VALUES (?, ?, ?)`,
        [stylist.id, stylist.name, stylist.specialties]
      );
    }

    // Insert business hours
    const businessHours = [
      { day: "monday", start_time: "09:00", end_time: "18:00" },
      { day: "tuesday", start_time: "09:00", end_time: "18:00" },
      { day: "wednesday", start_time: "09:00", end_time: "18:00" },
      { day: "thursday", start_time: "09:00", end_time: "18:00" },
      { day: "friday", start_time: "09:00", end_time: "18:00" },
      { day: "saturday", start_time: "09:00", end_time: "16:00" },
      { day: "sunday", start_time: "closed", end_time: "closed", is_closed: 1 },
    ];

    for (const hours of businessHours) {
      await this.runQuery(
        `INSERT OR IGNORE INTO business_hours (day, start_time, end_time, is_closed) VALUES (?, ?, ?, ?)`,
        [hours.day, hours.start_time, hours.end_time, hours.is_closed]
      );
    }
  }

  /**
   * Run a SQL query
   */
  runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  /**
   * Get data from database
   */
  getQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  /**
   * Get all data from database
   */
  allQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  /**
   * Customer operations
   */
  async createCustomer(customerData) {
    const { phone, name, email, hubspotContactId } = customerData;
    
    const result = await this.runQuery(
      `INSERT INTO customers (phone, name, email, hubspot_contact_id) VALUES (?, ?, ?, ?)`,
      [phone, name, email, hubspotContactId]
    );
    
    return result;
  }

  async getCustomer(phone) {
    return await this.getQuery(
      `SELECT * FROM customers WHERE phone = ?`,
      [phone]
    );
  }

  async updateCustomer(phone, updates) {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(", ");
    const values = Object.values(updates);
    values.push(phone);
    
    return await this.runQuery(
      `UPDATE customers SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE phone = ?`,
      values
    );
  }

  /**
   * Booking operations
   */
  async createBooking(bookingData) {
    const {
      id,
      customerPhone,
      serviceId,
      serviceName,
      date,
      time,
      duration,
      stylistId,
      stylistName,
      price,
      notes,
    } = bookingData;

    const result = await this.runQuery(
      `INSERT INTO bookings (id, customer_phone, service_id, service_name, date, time, duration, stylist_id, stylist_name, price, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, customerPhone, serviceId, serviceName, date, time, duration, stylistId, stylistName, price, notes]
    );

    return result;
  }

  async getBooking(bookingId) {
    return await this.getQuery(
      `SELECT * FROM bookings WHERE id = ?`,
      [bookingId]
    );
  }

  async getCustomerBookings(phone) {
    return await this.allQuery(
      `SELECT * FROM bookings WHERE customer_phone = ? ORDER BY date DESC, time DESC`,
      [phone]
    );
  }

  async updateBooking(bookingId, updates) {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(", ");
    const values = Object.values(updates);
    values.push(bookingId);
    
    return await this.runQuery(
      `UPDATE bookings SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );
  }

  async getAvailableBookings(date, serviceId, stylistId = null) {
    let sql = `
      SELECT * FROM bookings 
      WHERE date = ? AND service_id = ? AND status != 'cancelled'
    `;
    const params = [date, serviceId];
    
    if (stylistId) {
      sql += ` AND stylist_id = ?`;
      params.push(stylistId);
    }
    
    return await this.allQuery(sql, params);
  }

  /**
   * Conversation operations
   */
  async logConversation(conversationData) {
    const {
      customerPhone,
      messageId,
      messageType,
      content,
      responseTime,
      language,
      channel,
      context,
    } = conversationData;

    const result = await this.runQuery(
      `INSERT INTO conversations (customer_phone, message_id, message_type, content, response_time, language, channel, context) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [customerPhone, messageId, messageType, content, responseTime, language, channel, context]
    );

    return result;
  }

  async getConversationHistory(phone, limit = 10) {
    return await this.allQuery(
      `SELECT * FROM conversations WHERE customer_phone = ? ORDER BY created_at DESC LIMIT ?`,
      [phone, limit]
    );
  }

  /**
   * Analytics operations
   */
  async logAnalytics(eventData) {
    const { eventType, customerPhone, data } = eventData;
    
    const result = await this.runQuery(
      `INSERT INTO analytics (event_type, customer_phone, data) VALUES (?, ?, ?)`,
      [eventType, customerPhone, JSON.stringify(data)]
    );

    return result;
  }

  async getAnalytics(eventType, startDate, endDate) {
    return await this.allQuery(
      `SELECT * FROM analytics WHERE event_type = ? AND created_at BETWEEN ? AND ? ORDER BY created_at DESC`,
      [eventType, startDate, endDate]
    );
  }

  /**
   * Service operations
   */
  async getServices() {
    return await this.allQuery(
      `SELECT * FROM services WHERE active = 1 ORDER BY name`
    );
  }

  async getService(serviceId) {
    return await this.getQuery(
      `SELECT * FROM services WHERE id = ? AND active = 1`,
      [serviceId]
    );
  }

  /**
   * Stylist operations
   */
  async getStylists() {
    return await this.allQuery(
      `SELECT * FROM stylists WHERE active = 1 ORDER BY name`
    );
  }

  async getStylist(stylistId) {
    return await this.getQuery(
      `SELECT * FROM stylists WHERE id = ? AND active = 1`,
      [stylistId]
    );
  }

  /**
   * Business hours operations
   */
  async getBusinessHours() {
    return await this.allQuery(
      `SELECT * FROM business_hours ORDER BY 
        CASE day 
          WHEN 'monday' THEN 1 
          WHEN 'tuesday' THEN 2 
          WHEN 'wednesday' THEN 3 
          WHEN 'thursday' THEN 4 
          WHEN 'friday' THEN 5 
          WHEN 'saturday' THEN 6 
          WHEN 'sunday' THEN 7 
        END`
    );
  }

  /**
   * Close database connection
   */
  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error("❌ Error closing database:", err);
        } else {
          console.log("✅ Database connection closed");
        }
      });
    }
  }
}

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = Database;
} else if (typeof window !== "undefined") {
  window.Database = Database;
}







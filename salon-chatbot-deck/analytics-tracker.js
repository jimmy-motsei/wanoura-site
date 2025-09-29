/**
 * Analytics Tracker
 * Handles conversation analytics, booking metrics, and KPI tracking
 */

class AnalyticsTracker {
  constructor(config = {}) {
    this.config = {
      trackConversations: config.trackConversations !== false,
      trackBookings: config.trackBookings !== false,
      trackRevenue: config.trackRevenue !== false,
      trackCustomerSatisfaction: config.trackCustomerSatisfaction !== false,
      trackPerformance: config.trackPerformance !== false,
      ...config,
    };

    // In-memory storage (use database in production)
    this.conversations = new Map();
    this.bookings = new Map();
    this.metrics = new Map();
    this.kpis = {
      totalConversations: 0,
      totalBookings: 0,
      totalRevenue: 0,
      averageResponseTime: 0,
      customerSatisfaction: 0,
      conversionRate: 0,
    };
  }

  /**
   * Track conversation metrics
   * @param {Object} conversationData - Conversation data
   */
  trackConversation(conversationData) {
    try {
      if (!this.config.trackConversations) return;

      const {
        customerId,
        messageType = "text",
        responseTime = 0,
        language = "en",
        channel = "whatsapp",
        timestamp = new Date().toISOString(),
      } = conversationData;

      const conversation = {
        id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        customerId,
        messageType,
        responseTime,
        language,
        channel,
        timestamp,
        date: new Date().toISOString().split("T")[0],
      };

      this.conversations.set(conversation.id, conversation);
      this.updateConversationKPIs();
    } catch (error) {
      console.error("Error tracking conversation:", error);
    }
  }

  /**
   * Track booking metrics
   * @param {Object} bookingData - Booking data
   */
  trackBooking(bookingData) {
    try {
      if (!this.config.trackBookings) return;

      const {
        customerId,
        bookingId,
        serviceType,
        value = 0,
        bookingDate,
        stylistId,
        timestamp = new Date().toISOString(),
      } = bookingData;

      const booking = {
        id: bookingId,
        customerId,
        serviceType,
        value,
        bookingDate,
        stylistId,
        timestamp,
        date: new Date().toISOString().split("T")[0],
      };

      this.bookings.set(bookingId, booking);
      this.updateBookingKPIs();
    } catch (error) {
      console.error("Error tracking booking:", error);
    }
  }

  /**
   * Track customer satisfaction
   * @param {Object} satisfactionData - Satisfaction data
   */
  trackSatisfaction(satisfactionData) {
    try {
      if (!this.config.trackCustomerSatisfaction) return;

      const {
        customerId,
        rating,
        feedback,
        bookingId,
        timestamp = new Date().toISOString(),
      } = satisfactionData;

      const satisfaction = {
        customerId,
        rating,
        feedback,
        bookingId,
        timestamp,
        date: new Date().toISOString().split("T")[0],
      };

      this.metrics.set(`satisfaction_${customerId}_${Date.now()}`, satisfaction);
      this.updateSatisfactionKPIs();
    } catch (error) {
      console.error("Error tracking satisfaction:", error);
    }
  }

  /**
   * Track performance metrics
   * @param {Object} performanceData - Performance data
   */
  trackPerformance(performanceData) {
    try {
      if (!this.config.trackPerformance) return;

      const {
        metric,
        value,
        timestamp = new Date().toISOString(),
        metadata = {},
      } = performanceData;

      const performance = {
        metric,
        value,
        timestamp,
        metadata,
        date: new Date().toISOString().split("T")[0],
      };

      this.metrics.set(`perf_${metric}_${Date.now()}`, performance);
      this.updatePerformanceKPIs();
    } catch (error) {
      console.error("Error tracking performance:", error);
    }
  }

  /**
   * Get analytics dashboard data
   * @param {string} period - Time period (day, week, month)
   * @returns {Object} - Dashboard data
   */
  getDashboardData(period = "day") {
    try {
      const now = new Date();
      const startDate = this.getStartDate(period, now);
      const endDate = now;

      const filteredConversations = this.filterByDateRange(
        Array.from(this.conversations.values()),
        startDate,
        endDate
      );

      const filteredBookings = this.filterByDateRange(
        Array.from(this.bookings.values()),
        startDate,
        endDate
      );

      const filteredMetrics = this.filterByDateRange(
        Array.from(this.metrics.values()),
        startDate,
        endDate
      );

      return {
        period,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
        kpis: this.calculateKPIs(filteredConversations, filteredBookings),
        conversations: {
          total: filteredConversations.length,
          byLanguage: this.groupByLanguage(filteredConversations),
          byChannel: this.groupByChannel(filteredConversations),
          averageResponseTime: this.calculateAverageResponseTime(
            filteredConversations
          ),
        },
        bookings: {
          total: filteredBookings.length,
          revenue: this.calculateTotalRevenue(filteredBookings),
          byService: this.groupByService(filteredBookings),
          byStylist: this.groupByStylist(filteredBookings),
          conversionRate: this.calculateConversionRate(
            filteredConversations,
            filteredBookings
          ),
        },
        satisfaction: this.calculateSatisfactionMetrics(filteredMetrics),
        performance: this.calculatePerformanceMetrics(filteredMetrics),
      };
    } catch (error) {
      console.error("Error getting dashboard data:", error);
      return {
        period,
        error: error.message,
        kpis: this.kpis,
        conversations: { total: 0 },
        bookings: { total: 0, revenue: 0 },
        satisfaction: { average: 0 },
        performance: {},
      };
    }
  }

  /**
   * Update conversation KPIs
   */
  updateConversationKPIs() {
    const conversations = Array.from(this.conversations.values());
    this.kpis.totalConversations = conversations.length;
    this.kpis.averageResponseTime = this.calculateAverageResponseTime(
      conversations
    );
  }

  /**
   * Update booking KPIs
   */
  updateBookingKPIs() {
    const bookings = Array.from(this.bookings.values());
    this.kpis.totalBookings = bookings.length;
    this.kpis.totalRevenue = this.calculateTotalRevenue(bookings);
  }

  /**
   * Update satisfaction KPIs
   */
  updateSatisfactionKPIs() {
    const satisfactionData = Array.from(this.metrics.values()).filter(
      (metric) => metric.metric === "satisfaction"
    );
    this.kpis.customerSatisfaction = this.calculateAverageSatisfaction(
      satisfactionData
    );
  }

  /**
   * Update performance KPIs
   */
  updatePerformanceKPIs() {
    // Implementation for performance metrics
  }

  /**
   * Calculate KPIs from filtered data
   */
  calculateKPIs(conversations, bookings) {
    return {
      totalConversations: conversations.length,
      totalBookings: bookings.length,
      totalRevenue: this.calculateTotalRevenue(bookings),
      averageResponseTime: this.calculateAverageResponseTime(conversations),
      conversionRate: this.calculateConversionRate(conversations, bookings),
      customerSatisfaction: this.calculateAverageSatisfaction(
        Array.from(this.metrics.values())
      ),
    };
  }

  /**
   * Calculate total revenue
   */
  calculateTotalRevenue(bookings) {
    return bookings.reduce((total, booking) => total + (booking.value || 0), 0);
  }

  /**
   * Calculate average response time
   */
  calculateAverageResponseTime(conversations) {
    if (conversations.length === 0) return 0;
    const totalTime = conversations.reduce(
      (total, conv) => total + (conv.responseTime || 0),
      0
    );
    return Math.round(totalTime / conversations.length);
  }

  /**
   * Calculate conversion rate
   */
  calculateConversionRate(conversations, bookings) {
    if (conversations.length === 0) return 0;
    return Math.round((bookings.length / conversations.length) * 100);
  }

  /**
   * Calculate average satisfaction
   */
  calculateAverageSatisfaction(metrics) {
    const satisfactionData = metrics.filter(
      (metric) => metric.metric === "satisfaction" && metric.rating
    );
    if (satisfactionData.length === 0) return 0;
    const totalRating = satisfactionData.reduce(
      (total, data) => total + data.rating,
      0
    );
    return Math.round((totalRating / satisfactionData.length) * 10) / 10;
  }

  /**
   * Group conversations by language
   */
  groupByLanguage(conversations) {
    const groups = {};
    conversations.forEach((conv) => {
      const lang = conv.language || "unknown";
      groups[lang] = (groups[lang] || 0) + 1;
    });
    return groups;
  }

  /**
   * Group conversations by channel
   */
  groupByChannel(conversations) {
    const groups = {};
    conversations.forEach((conv) => {
      const channel = conv.channel || "unknown";
      groups[channel] = (groups[channel] || 0) + 1;
    });
    return groups;
  }

  /**
   * Group bookings by service
   */
  groupByService(bookings) {
    const groups = {};
    bookings.forEach((booking) => {
      const service = booking.serviceType || "unknown";
      groups[service] = (groups[service] || 0) + 1;
    });
    return groups;
  }

  /**
   * Group bookings by stylist
   */
  groupByStylist(bookings) {
    const groups = {};
    bookings.forEach((booking) => {
      const stylist = booking.stylistId || "unknown";
      groups[stylist] = (groups[stylist] || 0) + 1;
    });
    return groups;
  }

  /**
   * Calculate satisfaction metrics
   */
  calculateSatisfactionMetrics(metrics) {
    const satisfactionData = metrics.filter(
      (metric) => metric.metric === "satisfaction"
    );
    return {
      total: satisfactionData.length,
      average: this.calculateAverageSatisfaction(satisfactionData),
      distribution: this.calculateSatisfactionDistribution(satisfactionData),
    };
  }

  /**
   * Calculate performance metrics
   */
  calculatePerformanceMetrics(metrics) {
    const performanceData = metrics.filter(
      (metric) => metric.metric !== "satisfaction"
    );
    const groups = {};
    performanceData.forEach((metric) => {
      const key = metric.metric;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(metric.value);
    });

    const performance = {};
    Object.keys(groups).forEach((key) => {
      const values = groups[key];
      performance[key] = {
        count: values.length,
        average: Math.round(
          (values.reduce((a, b) => a + b, 0) / values.length) * 100
        ) / 100,
        min: Math.min(...values),
        max: Math.max(...values),
      };
    });

    return performance;
  }

  /**
   * Calculate satisfaction distribution
   */
  calculateSatisfactionDistribution(satisfactionData) {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    satisfactionData.forEach((data) => {
      if (data.rating >= 1 && data.rating <= 5) {
        distribution[data.rating]++;
      }
    });
    return distribution;
  }

  /**
   * Filter data by date range
   */
  filterByDateRange(data, startDate, endDate) {
    return data.filter((item) => {
      const itemDate = new Date(item.timestamp || item.date);
      return itemDate >= startDate && itemDate <= endDate;
    });
  }

  /**
   * Get start date for period
   */
  getStartDate(period, endDate) {
    const start = new Date(endDate);
    switch (period) {
      case "day":
        start.setDate(start.getDate() - 1);
        break;
      case "week":
        start.setDate(start.getDate() - 7);
        break;
      case "month":
        start.setMonth(start.getMonth() - 1);
        break;
      default:
        start.setDate(start.getDate() - 1);
    }
    return start;
  }

  /**
   * Get raw data for export
   */
  exportData(period = "day") {
    const now = new Date();
    const startDate = this.getStartDate(period, now);
    const endDate = now;

    return {
      conversations: this.filterByDateRange(
        Array.from(this.conversations.values()),
        startDate,
        endDate
      ),
      bookings: this.filterByDateRange(
        Array.from(this.bookings.values()),
        startDate,
        endDate
      ),
      metrics: this.filterByDateRange(
        Array.from(this.metrics.values()),
        startDate,
        endDate
      ),
    };
  }

  /**
   * Clear old data to prevent memory issues
   */
  cleanupOldData(daysToKeep = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    // Clean conversations
    for (const [id, conversation] of this.conversations) {
      if (new Date(conversation.timestamp) < cutoffDate) {
        this.conversations.delete(id);
      }
    }

    // Clean bookings
    for (const [id, booking] of this.bookings) {
      if (new Date(booking.timestamp) < cutoffDate) {
        this.bookings.delete(id);
      }
    }

    // Clean metrics
    for (const [id, metric] of this.metrics) {
      if (new Date(metric.timestamp) < cutoffDate) {
        this.metrics.delete(id);
      }
    }
  }
}

// Export for use in Node.js or browser
if (typeof module !== "undefined" && module.exports) {
  module.exports = AnalyticsTracker;
} else if (typeof window !== "undefined") {
  window.AnalyticsTracker = AnalyticsTracker;
}


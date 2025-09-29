/**
 * Salon Booking Manager
 * Handles appointment booking, scheduling, and management logic
 */

class BookingManager {
  constructor(config = {}) {
    this.config = {
      businessHours: config.businessHours || {
        monday: { start: "09:00", end: "18:00" },
        tuesday: { start: "09:00", end: "18:00" },
        wednesday: { start: "09:00", end: "18:00" },
        thursday: { start: "09:00", end: "18:00" },
        friday: { start: "09:00", end: "18:00" },
        saturday: { start: "09:00", end: "16:00" },
        sunday: { start: "closed", end: "closed" },
      },
      appointmentDuration: config.appointmentDuration || 60, // minutes
      bufferTime: config.bufferTime || 15, // minutes between appointments
      maxAdvanceBooking: config.maxAdvanceBooking || 30, // days
      minAdvanceBooking: config.minAdvanceBooking || 2, // hours
      services: config.services || [
        { id: "haircut", name: "Haircut & Styling", duration: 60, price: 250 },
        { id: "coloring", name: "Hair Coloring", duration: 120, price: 450 },
        { id: "highlights", name: "Highlights", duration: 180, price: 600 },
        { id: "balayage", name: "Balayage", duration: 240, price: 800 },
        { id: "treatment", name: "Hair Treatment", duration: 90, price: 300 },
        { id: "bridal", name: "Bridal Hair", duration: 180, price: 1200 },
        { id: "mens", name: "Men's Grooming", duration: 45, price: 180 },
      ],
      stylists: config.stylists || [
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
      ...config,
    };

    this.bookings = new Map(); // In production, this would be a database
    this.availabilityCache = new Map();
    this.bookingLocks = new Map(); // Prevent race conditions
  }

  /**
   * Get available time slots for a specific date and service
   * @param {string} date - Date in YYYY-MM-DD format
   * @param {string} serviceId - Service ID
   * @param {string} stylistId - Optional stylist ID
   * @returns {Promise<Array>} - Available time slots
   */
  async getAvailableSlots(date, serviceId, stylistId = null) {
    try {
      const service = this.config.services.find((s) => s.id === serviceId);
      if (!service) {
        throw new Error(`Service ${serviceId} not found`);
      }

      const dayOfWeek = new Date(date).toLocaleDateString("en-US", {
        weekday: "lowercase",
      });
      const businessHours = this.config.businessHours[dayOfWeek];

      if (!businessHours || businessHours.start === "closed") {
        return [];
      }

      const slots = [];
      const startTime = this.parseTime(businessHours.start);
      const endTime = this.parseTime(businessHours.end);
      const duration = service.duration + this.config.bufferTime;

      // Generate time slots
      for (let time = startTime; time + duration <= endTime; time += 30) {
        const slotTime = this.formatTime(time);
        const slotEndTime = this.formatTime(time + service.duration);

        // Check if slot is available
        const isAvailable = await this.isSlotAvailable(
          date,
          slotTime,
          serviceId,
          stylistId
        );

        if (isAvailable) {
          slots.push({
            time: slotTime,
            endTime: slotEndTime,
            duration: service.duration,
            available: true,
          });
        }
      }

      return slots;
    } catch (error) {
      console.error("Error getting available slots:", error);
      return [];
    }
  }

  /**
   * Check if a specific time slot is available
   * @param {string} date - Date in YYYY-MM-DD format
   * @param {string} time - Time in HH:MM format
   * @param {string} serviceId - Service ID
   * @param {string} stylistId - Optional stylist ID
   * @returns {Promise<boolean>} - Availability status
   */
  async isSlotAvailable(date, time, serviceId, stylistId = null) {
    try {
      const service = this.config.services.find((s) => s.id === serviceId);
      if (!service) {
        return false;
      }

      const slotKey = `${date}_${time}_${serviceId}`;

      // Check cache first
      if (this.availabilityCache.has(slotKey)) {
        return this.availabilityCache.get(slotKey);
      }

      // Check for existing bookings
      const existingBookings = Array.from(this.bookings.values()).filter(
        (booking) =>
          booking.date === date &&
          booking.status !== "cancelled" &&
          this.isTimeOverlapping(
            time,
            service.duration,
            booking.time,
            booking.duration
          )
      );

      // If stylist is specified, check stylist availability
      if (stylistId) {
        const stylistBookings = existingBookings.filter(
          (booking) => booking.stylistId === stylistId
        );
        const isAvailable = stylistBookings.length === 0;
        this.availabilityCache.set(slotKey, isAvailable);
        return isAvailable;
      }

      // Check general availability
      const isAvailable = existingBookings.length === 0;
      this.availabilityCache.set(slotKey, isAvailable);
      return isAvailable;
    } catch (error) {
      console.error("Error checking slot availability:", error);
      return false;
    }
  }

  /**
   * Create a new appointment booking
   * @param {Object} bookingData - Booking details
   * @returns {Promise<Object>} - Booking result
   */
  async createBooking(bookingData) {
    const lockKey = `${bookingData.date}_${bookingData.time}_${bookingData.serviceId}`;
    
    // Check if slot is already being processed
    if (this.bookingLocks.has(lockKey)) {
      throw new Error("Booking slot is being processed by another request. Please try again in a moment.");
    }
    
    // Acquire lock
    this.bookingLocks.set(lockKey, true);
    
    try {
      const {
        customerName,
        customerPhone,
        customerEmail,
        serviceId,
        date,
        time,
        stylistId,
        notes = "",
      } = bookingData;

      // Validate required fields
      if (!customerName || !customerPhone || !serviceId || !date || !time) {
        throw new Error("Missing required booking information");
      }

      // Validate service
      const service = this.config.services.find((s) => s.id === serviceId);
      if (!service) {
        throw new Error(`Service ${serviceId} not found`);
      }

      // Validate date and time
      const appointmentDate = new Date(`${date}T${time}`);
      const now = new Date();

      if (appointmentDate <= now) {
        throw new Error("Cannot book appointments in the past");
      }

      // Check availability
      const isAvailable = await this.isSlotAvailable(
        date,
        time,
        serviceId,
        stylistId
      );
      if (!isAvailable) {
        throw new Error("Time slot is no longer available");
      }

      // Generate booking ID
      const bookingId = this.generateBookingId();

      // Create booking object
      const booking = {
        id: bookingId,
        customerName,
        customerPhone,
        customerEmail,
        serviceId,
        serviceName: service.name,
        date,
        time,
        duration: service.duration,
        stylistId,
        stylistName: stylistId
          ? this.getStylistName(stylistId)
          : "Any Available",
        price: service.price,
        status: "confirmed",
        notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Store booking
      this.bookings.set(bookingId, booking);

      // Clear availability cache for this date
      this.clearAvailabilityCache(date);

      return {
        success: true,
        booking,
        confirmationMessage: this.generateBookingConfirmation(booking),
      };
    } catch (error) {
      console.error("Error creating booking:", error);
      return {
        success: false,
        error: error.message,
      };
    } finally {
      // Always release the lock
      this.bookingLocks.delete(lockKey);
    }
  }

  /**
   * Cancel an existing booking
   * @param {string} bookingId - Booking ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise<Object>} - Cancellation result
   */
  async cancelBooking(bookingId, reason = "") {
    try {
      const booking = this.bookings.get(bookingId);
      if (!booking) {
        throw new Error("Booking not found");
      }

      if (booking.status === "cancelled") {
        throw new Error("Booking is already cancelled");
      }

      // Update booking status
      booking.status = "cancelled";
      booking.cancellationReason = reason;
      booking.updatedAt = new Date().toISOString();

      this.bookings.set(bookingId, booking);

      // Clear availability cache
      this.clearAvailabilityCache(booking.date);

      return {
        success: true,
        booking,
        cancellationMessage: this.generateCancellationConfirmation(booking),
      };
    } catch (error) {
      console.error("Error cancelling booking:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Reschedule an existing booking
   * @param {string} bookingId - Booking ID
   * @param {string} newDate - New date
   * @param {string} newTime - New time
   * @returns {Promise<Object>} - Reschedule result
   */
  async rescheduleBooking(bookingId, newDate, newTime) {
    try {
      const booking = this.bookings.get(bookingId);
      if (!booking) {
        throw new Error("Booking not found");
      }

      if (booking.status === "cancelled") {
        throw new Error("Cannot reschedule a cancelled booking");
      }

      // Check new slot availability
      const isAvailable = await this.isSlotAvailable(
        newDate,
        newTime,
        booking.serviceId,
        booking.stylistId
      );
      if (!isAvailable) {
        throw new Error("New time slot is not available");
      }

      // Update booking
      const oldDate = booking.date;
      const oldTime = booking.time;

      booking.date = newDate;
      booking.time = newTime;
      booking.updatedAt = new Date().toISOString();

      this.bookings.set(bookingId, booking);

      // Clear availability cache for both dates
      this.clearAvailabilityCache(oldDate);
      this.clearAvailabilityCache(newDate);

      return {
        success: true,
        booking,
        rescheduleMessage: this.generateRescheduleConfirmation(
          booking,
          oldDate,
          oldTime
        ),
      };
    } catch (error) {
      console.error("Error rescheduling booking:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get booking by ID
   * @param {string} bookingId - Booking ID
   * @returns {Object|null} - Booking object or null
   */
  getBooking(bookingId) {
    return this.bookings.get(bookingId) || null;
  }

  /**
   * Get bookings by customer phone
   * @param {string} phone - Customer phone number
   * @returns {Array} - Array of bookings
   */
  getCustomerBookings(phone) {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.customerPhone === phone
    );
  }

  /**
   * Get stylist name by ID
   * @param {string} stylistId - Stylist ID
   * @returns {string} - Stylist name
   */
  getStylistName(stylistId) {
    const stylist = this.config.stylists.find((s) => s.id === stylistId);
    return stylist ? stylist.name : "Unknown Stylist";
  }

  /**
   * Generate booking confirmation message
   * @param {Object} booking - Booking object
   * @returns {string} - Confirmation message
   */
  generateBookingConfirmation(booking) {
    return `🎉 *Booking Confirmed!*

*Booking ID:* ${booking.id}
*Customer:* ${booking.customerName}
*Service:* ${booking.serviceName}
*Date:* ${booking.date}
*Time:* ${booking.time}
*Stylist:* ${booking.stylistName}
*Price:* R${booking.price}

*Important:* Please arrive 10 minutes early. Cancel or reschedule at least 24 hours in advance.`;
  }

  /**
   * Generate cancellation confirmation message
   * @param {Object} booking - Booking object
   * @returns {string} - Cancellation message
   */
  generateCancellationConfirmation(booking) {
    return `✅ *Booking Cancelled*

*Booking ID:* ${booking.id}
*Service:* ${booking.serviceName}
*Date:* ${booking.date}
*Time:* ${booking.time}

Your booking has been successfully cancelled. We hope to see you again soon!`;
  }

  /**
   * Generate reschedule confirmation message
   * @param {Object} booking - Booking object
   * @param {string} oldDate - Previous date
   * @param {string} oldTime - Previous time
   * @returns {string} - Reschedule message
   */
  generateRescheduleConfirmation(booking, oldDate, oldTime) {
    return `📅 *Booking Rescheduled*

*Booking ID:* ${booking.id}
*Service:* ${booking.serviceName}
*Previous:* ${oldDate} at ${oldTime}
*New Date:* ${booking.date}
*New Time:* ${booking.time}
*Stylist:* ${booking.stylistName}

Your appointment has been successfully rescheduled!`;
  }

  // Helper methods
  parseTime(timeString) {
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours * 60 + minutes;
  }

  formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}`;
  }

  isTimeOverlapping(time1, duration1, time2, duration2) {
    const start1 = this.parseTime(time1);
    const end1 = start1 + duration1;
    const start2 = this.parseTime(time2);
    const end2 = start2 + duration2;

    return !(end1 <= start2 || end2 <= start1);
  }

  generateBookingId() {
    return "BK" + Date.now().toString(36).toUpperCase();
  }

  clearAvailabilityCache(date) {
    for (const key of this.availabilityCache.keys()) {
      if (key.startsWith(date)) {
        this.availabilityCache.delete(key);
      }
    }
  }
}

// Export for use in Node.js or browser
if (typeof module !== "undefined" && module.exports) {
  module.exports = BookingManager;
} else if (typeof window !== "undefined") {
  window.BookingManager = BookingManager;
}





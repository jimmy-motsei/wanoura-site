/**
 * Input Validator
 * Provides comprehensive input validation for the salon chatbot platform
 */

class InputValidator {
  /**
   * Validate phone number format
   * @param {string} phone - Phone number to validate
   * @returns {Object} - Validation result
   */
  static validatePhoneNumber(phone) {
    if (!phone || typeof phone !== "string") {
      return { isValid: false, error: "Phone number is required" };
    }

    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, "");

    // Check if it's a valid length (7-15 digits)
    if (cleaned.length < 7 || cleaned.length > 15) {
      return { isValid: false, error: "Phone number must be 7-15 digits" };
    }

    // Check if it starts with a valid country code or local format
    if (cleaned.length < 10) {
      return { isValid: false, error: "Phone number too short" };
    }

    return { isValid: true, cleaned: `+${cleaned}` };
  }

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {Object} - Validation result
   */
  static validateEmail(email) {
    if (!email || typeof email !== "string") {
      return { isValid: false, error: "Email is required" };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, error: "Invalid email format" };
    }

    if (email.length > 254) {
      return { isValid: false, error: "Email too long" };
    }

    return { isValid: true, cleaned: email.toLowerCase().trim() };
  }

  /**
   * Validate name format
   * @param {string} name - Name to validate
   * @returns {Object} - Validation result
   */
  static validateName(name) {
    if (!name || typeof name !== "string") {
      return { isValid: false, error: "Name is required" };
    }

    const trimmed = name.trim();
    if (trimmed.length < 2) {
      return { isValid: false, error: "Name must be at least 2 characters" };
    }

    if (trimmed.length > 100) {
      return { isValid: false, error: "Name too long" };
    }

    // Check for valid characters (letters, spaces, hyphens, apostrophes)
    const nameRegex = /^[a-zA-Z\s\-']+$/;
    if (!nameRegex.test(trimmed)) {
      return { isValid: false, error: "Name contains invalid characters" };
    }

    return { isValid: true, cleaned: trimmed };
  }

  /**
   * Validate date format
   * @param {string} date - Date to validate
   * @returns {Object} - Validation result
   */
  static validateDate(date) {
    if (!date || typeof date !== "string") {
      return { isValid: false, error: "Date is required" };
    }

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return { isValid: false, error: "Invalid date format" };
    }

    // Check if date is in the future
    const now = new Date();
    if (dateObj <= now) {
      return { isValid: false, error: "Date must be in the future" };
    }

    // Check if date is not too far in the future (1 year)
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    if (dateObj > oneYearFromNow) {
      return { isValid: false, error: "Date cannot be more than 1 year in the future" };
    }

    return { isValid: true, cleaned: dateObj.toISOString().split("T")[0] };
  }

  /**
   * Validate time format
   * @param {string} time - Time to validate
   * @returns {Object} - Validation result
   */
  static validateTime(time) {
    if (!time || typeof time !== "string") {
      return { isValid: false, error: "Time is required" };
    }

    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      return { isValid: false, error: "Invalid time format (HH:MM)" };
    }

    return { isValid: true, cleaned: time };
  }

  /**
   * Validate service ID
   * @param {string} serviceId - Service ID to validate
   * @param {Array} validServices - Array of valid service IDs
   * @returns {Object} - Validation result
   */
  static validateServiceId(serviceId, validServices = []) {
    if (!serviceId || typeof serviceId !== "string") {
      return { isValid: false, error: "Service ID is required" };
    }

    if (validServices.length > 0 && !validServices.includes(serviceId)) {
      return { isValid: false, error: "Invalid service ID" };
    }

    return { isValid: true, cleaned: serviceId };
  }

  /**
   * Validate stylist ID
   * @param {string} stylistId - Stylist ID to validate
   * @param {Array} validStylists - Array of valid stylist IDs
   * @returns {Object} - Validation result
   */
  static validateStylistId(stylistId, validStylists = []) {
    if (!stylistId || typeof stylistId !== "string") {
      return { isValid: false, error: "Stylist ID is required" };
    }

    if (validStylists.length > 0 && !validStylists.includes(stylistId)) {
      return { isValid: false, error: "Invalid stylist ID" };
    }

    return { isValid: true, cleaned: stylistId };
  }

  /**
   * Validate booking data
   * @param {Object} bookingData - Booking data to validate
   * @param {Object} config - Configuration with valid services and stylists
   * @returns {Object} - Validation result
   */
  static validateBookingData(bookingData, config = {}) {
    const errors = [];
    const validServices = config.services?.map(s => s.id) || [];
    const validStylists = config.stylists?.map(s => s.id) || [];

    // Validate customer name
    const nameValidation = this.validateName(bookingData.customerName);
    if (!nameValidation.isValid) {
      errors.push(nameValidation.error);
    }

    // Validate customer phone
    const phoneValidation = this.validatePhoneNumber(bookingData.customerPhone);
    if (!phoneValidation.isValid) {
      errors.push(phoneValidation.error);
    }

    // Validate email if provided
    if (bookingData.customerEmail) {
      const emailValidation = this.validateEmail(bookingData.customerEmail);
      if (!emailValidation.isValid) {
        errors.push(emailValidation.error);
      }
    }

    // Validate service ID
    const serviceValidation = this.validateServiceId(bookingData.serviceId, validServices);
    if (!serviceValidation.isValid) {
      errors.push(serviceValidation.error);
    }

    // Validate date
    const dateValidation = this.validateDate(bookingData.date);
    if (!dateValidation.isValid) {
      errors.push(dateValidation.error);
    }

    // Validate time
    const timeValidation = this.validateTime(bookingData.time);
    if (!timeValidation.isValid) {
      errors.push(timeValidation.error);
    }

    // Validate stylist ID if provided
    if (bookingData.stylistId) {
      const stylistValidation = this.validateStylistId(bookingData.stylistId, validStylists);
      if (!stylistValidation.isValid) {
        errors.push(stylistValidation.error);
      }
    }

    if (errors.length > 0) {
      return { isValid: false, errors: errors };
    }

    return { isValid: true, cleaned: bookingData };
  }

  /**
   * Validate WhatsApp message
   * @param {Object} messageData - WhatsApp message data
   * @returns {Object} - Validation result
   */
  static validateWhatsAppMessage(messageData) {
    const errors = [];

    if (!messageData || typeof messageData !== "object") {
      return { isValid: false, error: "Message data is required" };
    }

    if (!messageData.from || typeof messageData.from !== "string") {
      errors.push("Sender phone number is required");
    } else {
      const phoneValidation = this.validatePhoneNumber(messageData.from);
      if (!phoneValidation.isValid) {
        errors.push(phoneValidation.error);
      }
    }

    if (!messageData.text || typeof messageData.text !== "string") {
      errors.push("Message text is required");
    } else if (messageData.text.length > 4096) {
      errors.push("Message text too long");
    }

    if (errors.length > 0) {
      return { isValid: false, errors: errors };
    }

    return { isValid: true, cleaned: messageData };
  }

  /**
   * Sanitize text input
   * @param {string} text - Text to sanitize
   * @returns {string} - Sanitized text
   */
  static sanitizeText(text) {
    if (!text || typeof text !== "string") {
      return "";
    }

    return text
      .trim()
      .replace(/[<>]/g, "") // Remove potential HTML tags
      .substring(0, 1000); // Limit length
  }

  /**
   * Validate webhook data
   * @param {Object} webhookData - Webhook data to validate
   * @returns {Object} - Validation result
   */
  static validateWebhookData(webhookData) {
    if (!webhookData || typeof webhookData !== "object") {
      return { isValid: false, error: "Webhook data is required" };
    }

    if (!webhookData.entry || !Array.isArray(webhookData.entry)) {
      return { isValid: false, error: "Invalid webhook structure" };
    }

    return { isValid: true, cleaned: webhookData };
  }

  /**
   * Validate customer profile data
   * @param {Object} profileData - Customer profile data
   * @returns {Object} - Validation result
   */
  static validateCustomerProfile(profileData) {
    const errors = [];

    if (!profileData || typeof profileData !== "object") {
      return { isValid: false, error: "Profile data is required" };
    }

    // Validate phone if provided
    if (profileData.phone) {
      const phoneValidation = this.validatePhoneNumber(profileData.phone);
      if (!phoneValidation.isValid) {
        errors.push(phoneValidation.error);
      }
    }

    // Validate email if provided
    if (profileData.email) {
      const emailValidation = this.validateEmail(profileData.email);
      if (!emailValidation.isValid) {
        errors.push(emailValidation.error);
      }
    }

    // Validate name if provided
    if (profileData.name) {
      const nameValidation = this.validateName(profileData.name);
      if (!nameValidation.isValid) {
        errors.push(nameValidation.error);
      }
    }

    if (errors.length > 0) {
      return { isValid: false, errors: errors };
    }

    return { isValid: true, cleaned: profileData };
  }
}

// Export for use in Node.js or browser
if (typeof module !== "undefined" && module.exports) {
  module.exports = InputValidator;
} else if (typeof window !== "undefined") {
  window.InputValidator = InputValidator;
}



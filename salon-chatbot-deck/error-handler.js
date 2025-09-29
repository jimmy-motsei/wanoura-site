/**
 * Standardized Error Handler
 * Provides consistent error response formats across all modules
 */

class ErrorHandler {
  /**
   * Create standardized error response
   * @param {string} message - Error message
   * @param {string} code - Error code
   * @param {Object} details - Additional error details
   * @returns {Object} - Standardized error response
   */
  static createErrorResponse(message, code = null, details = {}) {
    return {
      success: false,
      error: message,
      code: code,
      details: details,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create standardized success response
   * @param {Object} data - Response data
   * @param {string} message - Success message
   * @returns {Object} - Standardized success response
   */
  static createSuccessResponse(data = null, message = null) {
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
    };

    if (data !== null) {
      response.data = data;
    }

    if (message !== null) {
      response.message = message;
    }

    return response;
  }

  /**
   * Handle API errors with consistent formatting
   * @param {Error} error - Error object
   * @param {string} context - Error context
   * @returns {Object} - Formatted error response
   */
  static handleApiError(error, context = "API") {
    console.error(`${context} Error:`, error);

    // Extract meaningful error information
    let message = "An unexpected error occurred";
    let code = "UNKNOWN_ERROR";

    if (error.message) {
      message = error.message;
    }

    if (error.code) {
      code = error.code;
    } else if (error.status) {
      code = `HTTP_${error.status}`;
    }

    return this.createErrorResponse(message, code, {
      context: context,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }

  /**
   * Handle validation errors
   * @param {Array} validationErrors - Array of validation errors
   * @returns {Object} - Formatted validation error response
   */
  static handleValidationError(validationErrors) {
    return this.createErrorResponse(
      "Validation failed",
      "VALIDATION_ERROR",
      {
        validationErrors: validationErrors,
      }
    );
  }

  /**
   * Handle authentication errors
   * @param {string} message - Authentication error message
   * @returns {Object} - Formatted authentication error response
   */
  static handleAuthError(message = "Authentication failed") {
    return this.createErrorResponse(message, "AUTH_ERROR");
  }

  /**
   * Handle rate limiting errors
   * @param {string} message - Rate limit message
   * @returns {Object} - Formatted rate limit error response
   */
  static handleRateLimitError(message = "Rate limit exceeded") {
    return this.createErrorResponse(message, "RATE_LIMIT_ERROR");
  }

  /**
   * Handle service unavailable errors
   * @param {string} service - Service name
   * @returns {Object} - Formatted service unavailable error response
   */
  static handleServiceUnavailableError(service = "Service") {
    return this.createErrorResponse(
      `${service} is temporarily unavailable`,
      "SERVICE_UNAVAILABLE"
    );
  }

  /**
   * Handle timeout errors
   * @param {string} operation - Operation that timed out
   * @returns {Object} - Formatted timeout error response
   */
  static handleTimeoutError(operation = "Operation") {
    return this.createErrorResponse(
      `${operation} timed out`,
      "TIMEOUT_ERROR"
    );
  }

  /**
   * Handle not found errors
   * @param {string} resource - Resource that was not found
   * @returns {Object} - Formatted not found error response
   */
  static handleNotFoundError(resource = "Resource") {
    return this.createErrorResponse(
      `${resource} not found`,
      "NOT_FOUND_ERROR"
    );
  }

  /**
   * Handle conflict errors
   * @param {string} message - Conflict message
   * @returns {Object} - Formatted conflict error response
   */
  static handleConflictError(message = "Resource conflict") {
    return this.createErrorResponse(message, "CONFLICT_ERROR");
  }

  /**
   * Validate error response format
   * @param {Object} response - Response to validate
   * @returns {boolean} - Whether response is valid
   */
  static isValidErrorResponse(response) {
    return (
      response &&
      typeof response === "object" &&
      response.success === false &&
      typeof response.error === "string" &&
      typeof response.timestamp === "string"
    );
  }

  /**
   * Validate success response format
   * @param {Object} response - Response to validate
   * @returns {boolean} - Whether response is valid
   */
  static isValidSuccessResponse(response) {
    return (
      response &&
      typeof response === "object" &&
      response.success === true &&
      typeof response.timestamp === "string"
    );
  }

  /**
   * Wrap async function with error handling
   * @param {Function} asyncFn - Async function to wrap
   * @param {string} context - Error context
   * @returns {Function} - Wrapped function
   */
  static wrapAsync(asyncFn, context = "Async Operation") {
    return async (...args) => {
      try {
        return await asyncFn(...args);
      } catch (error) {
        return this.handleApiError(error, context);
      }
    };
  }

  /**
   * Create error logger
   * @param {string} module - Module name
   * @returns {Function} - Error logger function
   */
  static createErrorLogger(module) {
    return (error, context = "Unknown") => {
      console.error(`[${module}] ${context}:`, {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });
    };
  }
}

// Export for use in Node.js or browser
if (typeof module !== "undefined" && module.exports) {
  module.exports = ErrorHandler;
} else if (typeof window !== "undefined") {
  window.ErrorHandler = ErrorHandler;
}



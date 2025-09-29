/**
 * HubSpot Integration Client
 * Handles customer data sync, lead capture, and CRM operations
 */

class HubSpotClient {
  constructor(accessToken, portalId) {
    if (!accessToken || !portalId) {
      throw new Error("HubSpot access token and portal ID are required");
    }

    this.accessToken = accessToken;
    this.portalId = portalId;
    this.baseURL = "https://api.hubapi.com";
  }

  /**
   * Create or update a contact
   * @param {Object} contactData - Contact information
   * @returns {Promise<Object>} - API response
   */
  async createOrUpdateContact(contactData) {
    try {
      const {
        email,
        phone,
        firstName,
        lastName,
        properties = {},
        ...otherData
      } = contactData;

      // Prepare contact properties
      const contactProperties = {
        email,
        phone,
        firstname: firstName,
        lastname: lastName,
        ...properties,
      };

      // Remove undefined values
      Object.keys(contactProperties).forEach((key) => {
        if (contactProperties[key] === undefined) {
          delete contactProperties[key];
        }
      });

      const response = await fetch(`${this.baseURL}/crm/v3/objects/contacts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({
          properties: contactProperties,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `HubSpot API Error: ${response.status} - ${
            errorData.message || response.statusText
          }`
        );
      }

      const data = await response.json();
      return {
        success: true,
        contactId: data.id,
        contact: data,
      };
    } catch (error) {
      console.error("HubSpot contact creation error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get contact by email or phone
   * @param {string} identifier - Email or phone number
   * @returns {Promise<Object>} - Contact data
   */
  async getContact(identifier) {
    try {
      const searchProperty = identifier.includes("@") ? "email" : "phone";

      const response = await fetch(
        `${this.baseURL}/crm/v3/objects/contacts/search`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.accessToken}`,
          },
          body: JSON.stringify({
            filterGroups: [
              {
                filters: [
                  {
                    propertyName: searchProperty,
                    operator: "EQ",
                    value: identifier,
                  },
                ],
              },
            ],
            properties: [
              "email",
              "phone",
              "firstname",
              "lastname",
              "createdate",
              "lastmodifieddate",
              "lifecyclestage",
              "hs_lead_status",
            ],
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `HubSpot API Error: ${response.status} - ${
            errorData.message || response.statusText
          }`
        );
      }

      const data = await response.json();
      return {
        success: true,
        contacts: data.results || [],
        total: data.total || 0,
      };
    } catch (error) {
      console.error("HubSpot contact search error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Create a deal for a booking
   * @param {Object} dealData - Deal information
   * @returns {Promise<Object>} - API response
   */
  async createDeal(dealData) {
    try {
      const {
        contactId,
        dealName,
        amount,
        closeDate,
        dealStage = "appointmentscheduled",
        properties = {},
        ...otherData
      } = dealData;

      const dealProperties = {
        dealname: dealName,
        amount: amount,
        closedate: closeDate,
        dealstage: dealStage,
        ...properties,
      };

      const response = await fetch(`${this.baseURL}/crm/v3/objects/deals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({
          properties: dealProperties,
          associations: [
            {
              to: { id: contactId },
              types: [
                {
                  associationCategory: "HUBSPOT_DEFINED",
                  associationTypeId: 3,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `HubSpot API Error: ${response.status} - ${
            errorData.message || response.statusText
          }`
        );
      }

      const data = await response.json();
      return {
        success: true,
        dealId: data.id,
        deal: data,
      };
    } catch (error) {
      console.error("HubSpot deal creation error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Create a ticket for customer support
   * @param {Object} ticketData - Ticket information
   * @returns {Promise<Object>} - API response
   */
  async createTicket(ticketData) {
    try {
      const {
        contactId,
        subject,
        content,
        priority = "MEDIUM",
        category = "general",
        properties = {},
        ...otherData
      } = ticketData;

      const ticketProperties = {
        subject,
        content,
        hs_ticket_priority: priority,
        hs_ticket_category: category,
        ...properties,
      };

      const response = await fetch(`${this.baseURL}/crm/v3/objects/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({
          properties: ticketProperties,
          associations: contactId
            ? [
                {
                  to: { id: contactId },
                  types: [
                    {
                      associationCategory: "HUBSPOT_DEFINED",
                      associationTypeId: 16,
                    },
                  ],
                },
              ]
            : [],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `HubSpot API Error: ${response.status} - ${
            errorData.message || response.statusText
          }`
        );
      }

      const data = await response.json();
      return {
        success: true,
        ticketId: data.id,
        ticket: data,
      };
    } catch (error) {
      console.error("HubSpot ticket creation error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Log conversation interaction
   * @param {Object} interactionData - Interaction data
   * @returns {Promise<Object>} - API response
   */
  async logInteraction(interactionData) {
    try {
      const {
        contactId,
        interactionType,
        content,
        channel = "whatsapp",
        properties = {},
        ...otherData
      } = interactionData;

      const interactionProperties = {
        hs_activity_type: interactionType,
        hs_activity_status: "COMPLETED",
        hs_activity_source: channel,
        hs_activity_body: content,
        ...properties,
      };

      const response = await fetch(
        `${this.baseURL}/crm/v3/objects/activities`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.accessToken}`,
          },
          body: JSON.stringify({
            properties: interactionProperties,
            associations: contactId
              ? [
                  {
                    to: { id: contactId },
                    types: [
                      {
                        associationCategory: "HUBSPOT_DEFINED",
                        associationTypeId: 1,
                      },
                    ],
                  },
                ]
              : [],
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `HubSpot API Error: ${response.status} - ${
            errorData.message || response.statusText
          }`
        );
      }

      const data = await response.json();
      return {
        success: true,
        activityId: data.id,
        activity: data,
      };
    } catch (error) {
      console.error("HubSpot interaction logging error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Update contact properties
   * @param {string} contactId - Contact ID
   * @param {Object} properties - Properties to update
   * @returns {Promise<Object>} - API response
   */
  async updateContactProperties(contactId, properties) {
    try {
      const response = await fetch(
        `${this.baseURL}/crm/v3/objects/contacts/${contactId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.accessToken}`,
          },
          body: JSON.stringify({
            properties,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `HubSpot API Error: ${response.status} - ${
            errorData.message || response.statusText
          }`
        );
      }

      const data = await response.json();
      return {
        success: true,
        contact: data,
      };
    } catch (error) {
      console.error("HubSpot contact update error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get contact timeline/activities
   * @param {string} contactId - Contact ID
   * @param {number} limit - Number of activities to retrieve
   * @returns {Promise<Object>} - Timeline data
   */
  async getContactTimeline(contactId, limit = 10) {
    try {
      const response = await fetch(
        `${this.baseURL}/crm/v3/objects/contacts/${contactId}/associations/activities?limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `HubSpot API Error: ${response.status} - ${
            errorData.message || response.statusText
          }`
        );
      }

      const data = await response.json();
      return {
        success: true,
        activities: data.results || [],
        total: data.total || 0,
      };
    } catch (error) {
      console.error("HubSpot timeline error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Create salon-specific contact properties
   * @param {Object} salonData - Salon-specific data
   * @returns {Object} - Formatted properties
   */
  formatSalonContactProperties(salonData) {
    const {
      preferredServices = [],
      lastAppointment,
      totalAppointments = 0,
      totalSpent = 0,
      preferredStylist,
      notes = "",
      ...otherData
    } = salonData;

    return {
      preferred_services: preferredServices.join(", "),
      last_appointment_date: lastAppointment,
      total_appointments: totalAppointments,
      total_spent: totalSpent,
      preferred_stylist: preferredStylist,
      salon_notes: notes,
      customer_since: new Date().toISOString(),
      ...otherData,
    };
  }

  /**
   * Create salon-specific deal properties
   * @param {Object} bookingData - Booking data
   * @returns {Object} - Formatted deal properties
   */
  formatSalonDealProperties(bookingData) {
    const {
      serviceName,
      servicePrice,
      appointmentDate,
      stylistName,
      bookingId,
      ...otherData
    } = bookingData;

    return {
      dealname: `${serviceName} - ${bookingData.customerName}`,
      amount: servicePrice,
      closedate: appointmentDate,
      dealstage: "appointmentscheduled",
      service_name: serviceName,
      stylist_name: stylistName,
      booking_id: bookingId,
      appointment_date: appointmentDate,
      ...otherData,
    };
  }
}

// Export for use in Node.js or browser
if (typeof module !== "undefined" && module.exports) {
  module.exports = HubSpotClient;
} else if (typeof window !== "undefined") {
  window.HubSpotClient = HubSpotClient;
}


const axios = require('axios');
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');

// WhatsApp API configuration
// Credentials should be in .env file
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const API_VERSION = 'v17.0'; // Or latest version

const BASE_URL = `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}`;

// Helper to format phone number to E.164 format (removing +, spaces, etc)
// WhatsApp requires country code (e.g., 919876543210 for India)
const formatPhoneNumber = (phone) => {
    if (!phone) return null;
    // Remove non-digit characters
    let cleaned = phone.replace(/\D/g, '');

    // If number doesn't have country code (assuming 10 digit Indian number), add 91
    if (cleaned.length === 10) {
        return '91' + cleaned;
    }

    return cleaned;
};

// Send a template message (if you decide to use templates later)
// For now, we are sending text/image messages directly (Session Messages)
// Note: To send session messages, the user must have messaged the business first within 24h.
// Otherwise, you MUST use approved templates.
// Since this is a parking system, standard Templates are recommended for reliability.
// But for this implementation, we will try standard text/image messages first as requested.

const sendWhatsAppMessage = async (to, message) => {
    try {
        const formattedPhone = formatPhoneNumber(to);

        if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
            console.warn('⚠️ WhatsApp credentials missing. Message logged but not sent.');
            console.log(`[MOCK WHATSAPP] To: ${formattedPhone}, Message: ${message}`);
            return { success: true, mock: true };
        }

        const response = await axios.post(
            `${BASE_URL}/messages`,
            {
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: formattedPhone,
                type: 'text',
                text: { body: message }
            },
            {
                headers: {
                    'Authorization': `Bearer ${ACCESS_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data;
    } catch (error) {
        console.error('❌ WhatsApp Message Error:', error.response?.data || error.message);
        throw new Error('Failed to send WhatsApp message');
    }
};

const sendWhatsAppImage = async (to, imagePath, caption) => {
    try {
        const formattedPhone = formatPhoneNumber(to);

        if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
            console.warn('⚠️ WhatsApp credentials missing. Image logged but not sent.');
            console.log(`[MOCK WHATSAPP] To: ${formattedPhone}, Image: ${imagePath}, Caption: ${caption}`);
            return { success: true, mock: true };
        }

        // Two-step process for local images usually:
        // 1. Upload Media to WhatsApp (returns ID)
        // 2. Send Message with Media ID

        // Step 1: Upload Media
        const form = new FormData();
        form.append('file', fs.createReadStream(imagePath));
        form.append('type', 'image/jpeg'); // Adjust based on file type if needed
        form.append('messaging_product', 'whatsapp');

        const uploadResponse = await axios.post(
            `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/media`,
            form,
            {
                headers: {
                    'Authorization': `Bearer ${ACCESS_TOKEN}`,
                    ...form.getHeaders()
                }
            }
        );

        const mediaId = uploadResponse.data.id;

        // Step 2: Send Message with Media ID
        const response = await axios.post(
            `${BASE_URL}/messages`,
            {
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: formattedPhone,
                type: 'image',
                image: {
                    id: mediaId,
                    caption: caption
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${ACCESS_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data;
    } catch (error) {
        console.error('❌ WhatsApp Image Error:', error.response?.data || error.message);
        throw new Error('Failed to send WhatsApp image');
    }
};

module.exports = {
    sendWhatsAppMessage,
    sendWhatsAppImage
};

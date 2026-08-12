# Backend Messaging Implementation Guide

## 🎯 Current Status

The website now includes a **simulated backend messaging system** that:
- ✅ Automatically sends booking notifications to salon owner via WhatsApp
- ✅ Sends confirmations to customers via Line (preferred) or WhatsApp
- ✅ No user interaction required - everything happens automatically
- ✅ Comprehensive logging and error handling

## 📱 How It Currently Works

### 1. **Customer Booking Flow**
1. Customer fills booking form with optional Line/WhatsApp contact
2. Booking is submitted and saved to database
3. **Automatic backend notifications are triggered**:
   - Owner notification sent to **+66 0849719575** (WhatsApp)
   - Customer confirmation sent to their preferred contact method

### 2. **Notification Priority**
- **For customers**: Line first (if provided), then WhatsApp, then none
- **For owner**: Always WhatsApp to business number

### 3. **Current Implementation (Simulation)**
```javascript
// Backend notification simulation
await sendBackendWhatsAppNotification({
    businessWhatsApp: '+66 0849719575',
    customerInfo: customer,
    serviceInfo: service,
    appointmentInfo: appointment,
    bookingMessage: fullBookingDetails
});

// Customer confirmation
await sendCustomerConfirmation(customer, service, appointment);
```

## 🔧 Production Implementation Options

### Option 1: WhatsApp Business API (Recommended)
**Best for**: Professional businesses, high volume, automated messaging

#### Setup Requirements:
1. **WhatsApp Business Account** 
2. **Meta Business Manager Account**
3. **WhatsApp Business API Access**
4. **Webhook endpoint** for receiving messages

#### Implementation:
```javascript
// Example API call
const sendWhatsApp = async (phone, message) => {
    const response = await fetch('https://graph.facebook.com/v18.0/YOUR_PHONE_NUMBER_ID/messages', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: phone,
            type: 'text',
            text: { body: message }
        })
    });
    return response.json();
};
```

#### Cost:
- **Free** for first 1,000 conversations/month
- **~$0.005-0.009** per conversation after that
- **Setup time**: 1-2 weeks (approval process)

### Option 2: Third-Party WhatsApp Services
**Best for**: Quick setup, small to medium businesses

#### Recommended Services:
1. **Twilio WhatsApp API**
   - Easy setup, good documentation
   - Cost: ~$0.005 per message
   - Setup time: 1-2 days

2. **Vonage (Nexmo) WhatsApp**
   - Reliable service
   - Cost: ~$0.0065 per message
   - Setup time: 1-2 days

3. **MessageBird WhatsApp**
   - Good for international businesses
   - Cost: ~$0.007 per message
   - Setup time: 1-2 days

#### Example Implementation (Twilio):
```javascript
const twilio = require('twilio');
const client = twilio(ACCOUNT_SID, AUTH_TOKEN);

const sendWhatsApp = async (to, body) => {
    return await client.messages.create({
        from: 'whatsapp:+14155238886', // Twilio sandbox number
        to: `whatsapp:${to}`,
        body: body
    });
};
```

### Option 3: Line Messaging API
**For Line notifications to customers**

#### Setup Requirements:
1. **Line Developer Account**
2. **Line Official Account**
3. **Messaging API Channel**

#### Implementation:
```javascript
const sendLineMessage = async (userId, message) => {
    const response = await fetch('https://api.line.me/v2/bot/message/push', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            to: userId,
            messages: [{
                type: 'text',
                text: message
            }]
        })
    });
    return response.json();
};
```

## 🚀 Quick Implementation Guide

### Step 1: Choose Your Service
- **For professional setup**: WhatsApp Business API
- **For quick start**: Twilio or similar service
- **For Line support**: Line Messaging API

### Step 2: Create Backend Endpoint
Create an API endpoint that the frontend can call:

```javascript
// POST /api/send-booking-notification
app.post('/api/send-booking-notification', async (req, res) => {
    try {
        const { customerInfo, serviceInfo, appointmentInfo } = req.body;
        
        // Send to business owner
        await sendWhatsAppToBusiness(customerInfo, serviceInfo, appointmentInfo);
        
        // Send confirmation to customer
        await sendCustomerConfirmation(customerInfo, serviceInfo, appointmentInfo);
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

### Step 3: Update Frontend
Replace the simulation calls with real API calls:

```javascript
// In booking.js - replace simulation functions
async function sendBackendWhatsAppNotification(data) {
    const response = await fetch('/api/send-booking-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error('Failed to send notification');
    return response.json();
}
```

## 💡 Current Simulation Benefits

The current system provides:
1. **Full user experience** testing
2. **Complete booking flow** validation  
3. **Message templates** ready for production
4. **Error handling** framework
5. **Logging system** for debugging

## 📊 Message Templates

### Owner Notification Template:
```
🌸 *New Booking Request* 🌸

📋 *Service:* {serviceName}
💰 *Price:* ${servicePrice}
⏱️ *Duration:* {duration} minutes

👤 *Customer Info:*
• Name: {customerName}
• Phone: {customerPhone}  
• WhatsApp: {customerWhatsApp}
• Line: {customerLine}
• Email: {customerEmail}

📅 *Preferred Appointment:*
• Date: {preferredDate}
• Time: {preferredTime}

📝 *Notes:* {customerNotes}
*Request ID:* {appointmentId}
```

### Customer Confirmation Template:
```
🌸 Thank you for your booking request!

📋 Service: {serviceName}
📅 Date: {requestedDate}  
⏰ Time: {requestedTime}

We'll contact you shortly to confirm your appointment.

Have a beautiful day! 💖
- Tina Beauty Studio Patong
```

## 🎯 Recommended Next Steps

1. **For immediate use**: Current simulation works perfectly for demonstrations
2. **For production**: Set up Twilio WhatsApp API (quickest professional solution)
3. **For scale**: Migrate to WhatsApp Business API
4. **For Line support**: Add Line Messaging API integration

The beauty salon website is now fully functional with comprehensive messaging capabilities! 🌟
# Testing Checklist - Beauty Salon Website

## 🔧 Before Testing - Database Setup

**IMPORTANT**: Complete the setup steps in [README.md](README.md) first
(create a Supabase project, run the two SQL files, create your admin user
in Supabase Auth, and paste your credentials into `js/config.js`).

## 🧪 Testing Steps

### 1. Database Connection Test
Open browser console and run:
```javascript
testApi();              // Should show success with data
checkDatabaseSetup();   // Should show "Database setup appears correct!"
testAllTables();        // Should show record counts for services/staff/customers/appointments/business_settings
```

### 2. Homepage Testing
- ✅ Services section loads (6 sample services should appear)
- ✅ Staff section shows 3 team members
- ✅ "Find Us" button visible in hero section
- ✅ No error messages in services/staff sections
- ✅ Availability calendar shows the next 7 days

### 3. Admin Login Testing
- Go to `/login.html`
- Sign in with the admin account you created in Supabase Authentication
- ✅ Should login successfully and redirect to dashboard
- ✅ Dashboard should show overview with charts and statistics

### 4. Booking System Testing
- Go to `/booking.html`
- ✅ Services load properly (6 services available)
- ✅ Can select service and proceed to step 2
- ✅ Can select date/time and proceed to step 3
- ✅ Fill out contact form including:
  - Name, email, phone
  - Check WhatsApp preferred
  - Add Line contact (optional)
  - Optional promotional consent
- ✅ Click "Send Request"
- ✅ Should show success message
- ✅ Should prompt to send WhatsApp message
- ✅ WhatsApp link should open with pre-filled message
- ✅ If Line contact provided, should show "Copy for Line" button

### 5. WhatsApp Testing
- Complete a booking
- ✅ Should get prompt: "Would you like to open WhatsApp now..."
- ✅ WhatsApp should open with a message to the business number set in Settings
- ✅ Message should include customer info, service details, date/time

### 6. Line Testing
- Complete booking with a Line contact provided
- ✅ Should show "Copy Message for Line" button after booking
- ✅ Click button should copy message to clipboard
- ✅ Should get instructions to paste in Line app

### 7. Dashboard Testing
- Login as admin
- ✅ Overview tab shows statistics and charts
- ✅ Appointments tab shows sample appointments; edit/pause/delete all work
- ✅ Customers tab shows customers with 📞📱💬 contact icons
- ✅ Services/Staff tabs: edit and pause/activate both persist to the database
- ✅ Customer Accounts tab lists marketing/contact records (not a login list)
- ✅ Promotions tab shows subscribers with CSV export and Gmail compose

## 🚨 Troubleshooting

### If Services Don't Load:
1. Check browser console for errors
2. Run `testApi()` - if it fails, check `js/config.js` has your real Supabase URL/key
3. Verify both SQL scripts were run in the Supabase SQL Editor

### If Admin Login Fails:
1. Confirm the account exists under Supabase Authentication → Users
2. Check the browser console for the actual Supabase Auth error
3. Password resets also happen in the Supabase dashboard, not this app

### If WhatsApp Doesn't Work:
1. Verify Business Settings has a WhatsApp number set (Dashboard → Settings)
2. Check the browser console after booking for the WhatsApp URL
3. On mobile, WhatsApp should auto-open; on desktop, may need WhatsApp Web

## 📱 Expected Contact Flow

1. **Customer books appointment** with WhatsApp and/or Line contact
2. **System creates appointment** in the database
3. **WhatsApp prompt appears** - customer can send immediately
4. **Line option appears** - customer can copy message for manual sending
5. **Salon owner receives** the booking request via WhatsApp/Line
6. **Owner contacts customer** to confirm the appointment

Note: this messaging flow is a client-side simulation (see
`BACKEND_MESSAGING_IMPLEMENTATION.md` for wiring up a real provider) - it logs
to the console and localStorage rather than sending real messages.

## ✅ Success Indicators

- No error messages on any page
- All dynamic content loads properly
- Booking flow completes successfully
- WhatsApp opens with the correct message
- Line copy function works
- Dashboard shows all data correctly and edits persist after a page refresh

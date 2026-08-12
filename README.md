# Tina Beauty Studio Patong - Luxury Beauty & Wellness Website

A sophisticated beauty studio website with integrated management dashboard, featuring WhatsApp-based appointment requests, public booking calendar, customer management, and business analytics. Designed specifically for luxury beauty salons in Thailand.

## 🎯 Project Overview

**Tina Beauty Studio Patong** is an elegant, full-featured web application designed for premium beauty salons to manage their business operations and provide exceptional online experiences to customers. The project combines a luxurious public-facing website with a comprehensive management dashboard, utilizing modern WhatsApp integration for personalized booking confirmations.

## ✨ Current Features Completed

### Public Website Features:
- **Luxury Homepage** with elegant hero section, premium service showcase, professional team profiles, and contact information
- **Sophisticated Design** with purple-to-fuchsia gradient theme and professional imagery
- **WhatsApp Booking Requests** - 3-step appointment request process with WhatsApp integration
- **Premium Service Gallery** with high-quality images and detailed descriptions
- **Public Booking Calendar** - View-only calendar showing confirmed appointments and availability  
- **Streamlined Booking Flow** - Direct service selection to date/time booking
- **Enhanced Customer Forms** including WhatsApp number collection
- **WhatsApp Integration** - Backend message processing with owner notification system
- **Dynamic Content Loading** from database with elegant animations and effects
- **User Authentication System** - Automatic general user account creation during booking
- **Promotional Subscription System** - Multi-channel signup options with consent tracking

### Management Dashboard Features:
- **Admin Authentication System** with secure login and session management
- **Overview Dashboard** with optimized layout and key performance statistics
- **Today's Appointments & Revenue** tracking with compact display
- **Weekly Appointments Chart** using Chart.js with proper responsive sizing
- **Service Popularity Analytics** with interactive doughnut chart and optimized layout
- **Complete Appointments Management** with comprehensive editing, staff assignment, and status updates
- **Customer Database** with search functionality and visit history
- **Services Management** with ability to view, edit, pause/activate services (hidden from homepage when paused)
- **Staff Management** with comprehensive edit functionality and pause/activate controls (hidden from homepage when paused)
- **Customer/Subscriber Records** with search, activate/deactivate, and CSV export for marketing
- **Promotional Marketing System** with subscriber management, email list export, and Gmail integration
- **Business Settings** for salon information, contact details, and content

### Database & Data Management:
- **6 Database Tables**: Services, Staff, Customers, Appointments, Business Settings, Users (marketing contacts)
- **Admin Authentication** via Supabase Auth - no passwords stored in the app's own tables
- **RESTful API Integration** for all CRUD operations
- **Real-time Data Loading** with elegant error handling
- **Premium Sample Data** including high-quality service images and realistic Thai business information
- **WhatsApp Integration Schema** for booking request workflow with backend processing
- **Automatic User Account Creation** during booking process
- **Promotional Consent Tracking** with signup source attribution and marketing compliance

## 🛠 Technology Stack

### Frontend:
- **HTML5** - Semantic markup with luxury design elements
- **CSS3** - Custom styling with gradient themes and sophisticated animations
- **Tailwind CSS** - Utility-first CSS framework with custom fuchsia accent integration
- **JavaScript (ES6+)** - Interactive functionality, API integration, and WhatsApp messaging
- **Font Awesome 6** - Modern icon library with beauty-focused icons
- **Google Fonts** - Elegant typography (Inter + Playfair Display) for luxury branding

### Data Visualization:
- **Chart.js** - Interactive charts and analytics
- **Responsive Charts** - Mobile-friendly data visualization

### Backend/Database:
- **Supabase PostgreSQL** - Reliable external database with REST API
- **UUID Primary Keys** - Modern database design with proper relationships
- **Row Level Security** - Secure data access with proper authentication
- **Real-time Updates** - Dynamic content loading with robust error handling

## 📂 Project Structure

```
/
├── index.html              # Main homepage
├── booking.html            # Appointment booking system
├── dashboard.html          # Management dashboard (Admin only)
├── login.html              # Admin login system
├── js/
│   ├── main.js            # Homepage functionality
│   ├── booking.js         # Booking system logic
│   ├── dashboard.js       # Dashboard management
│   └── auth.js            # Authentication system
└── README.md              # Project documentation
```

## 🎪 Functional Entry Points

### Public Website:
- **/** (index.html) - Luxury homepage with elegant hero section, service gallery, and contact
  - Promotional signup section with modal for marketing consent
  - Interactive promotional offer call-to-action
  - Google Maps integration with hero overlay and contact section links
- **/booking.html** - WhatsApp-integrated appointment request system
  - Parameters: `?service=service_id` (optional, pre-selects service)
  - WhatsApp message auto-generation to salon owner
  - Automatic general user account creation
  - Promotional consent checkbox with conditional display
  - Request-based workflow (not instant booking)

### Authentication System:
- **/login.html** - Admin login interface, backed by Supabase Auth
  - No demo credentials: create your admin account in the Supabase dashboard
    (Authentication -> Users -> Add user) after running supabase-schema.sql
  - Session management handled entirely by Supabase Auth (JWT sessions)

### Management Dashboard (Admin Only):
- **/dashboard.html** - Comprehensive management interface with role-based access
  - Overview tab with analytics, charts, and statistics
  - Appointments management with full editing capabilities, staff assignment, and status filtering
  - Customer database with WhatsApp information and search
  - Services management with edit/pause functionality
  - Staff management with edit/pause functionality
  - Customer Accounts tab for marketing/contact records (not a login system)
  - Promotional Subscribers management with email marketing tools
  - Business settings including WhatsApp number configuration

### New Features:
- **Public Booking Calendar** - 7-day availability view on homepage
- **WhatsApp Integration** - Automatic message generation for booking requests
- **Enhanced Request Workflow** - Personal confirmation process via WhatsApp

## 🎯 Promotional Marketing System

The website includes a comprehensive promotional subscription system that differentiates between regular customers and marketing subscribers:

### **Signup Channels:**
1. **Booking Flow Integration**: Optional promotional consent checkbox during service booking
   - Conditional display: Hidden if user already subscribed
   - Auto-checks existing subscription status when email is entered
   - Clear messaging about exclusive offers and privacy

2. **Homepage Call-to-Action**: Dedicated promotional section after hero banner
   - Eye-catching gradient banner with exclusive offers messaging
   - Modal popup with detailed subscription form
   - Privacy-focused messaging with unsubscribe options

### **Marketing Management Features:**
- **Subscriber Dashboard**: Complete overview with signup source tracking
- **Statistics Cards**: Total subscribers, booking vs homepage signups
- **Email List Export**: One-click CSV download for external email clients
- **Gmail Integration**: Direct compose with BCC field pre-populated
- **Unsubscribe Management**: One-click removal with consent tracking
- **Source Attribution**: Track whether subscribers came from booking or homepage

### **Navigation & Location Features:**
- **Streamlined Navigation**: "Home" button in top-left logo area for easy site navigation
- **Google Maps Integration**: Direct links to business location in contact section
- **Hero Map Overlay**: Floating location button on homepage hero section for quick access
- **Mobile-Responsive Maps**: Location links work seamlessly on all devices

### **Enhanced Booking System:**
- **Backend WhatsApp Processing**: Automated message generation without user-facing popups
- **Improved Confirmation Flow**: Clear next-steps messaging after booking submission
- **Admin Notification System**: Backend processing for seamless owner communication
- **User-Friendly Experience**: No confusing external WhatsApp links for customers

### **Appointment Management:**
- **Comprehensive Editing**: Full appointment editor with date, time, staff, status, and notes
- **Staff Assignment**: Assign appointments to active staff members with conflict detection
- **Status Management**: Dropdown selection from all available appointment statuses
- **Validation & Conflict Detection**: Warns of staff scheduling conflicts before saving
- **Visual Status Indicators**: Color-coded appointment cards with staff assignment status
- **Secure Deletion**: Confirmation dialog with full appointment details before deletion
- **Real-time Updates**: Immediate UI refresh and statistics recalculation after changes

### **Privacy & Compliance:**
- **Explicit Consent**: Clear opt-in messaging with purpose explanation
- **Source Tracking**: Complete audit trail of how users subscribed
- **Easy Unsubscribe**: Simple removal process with confirmation
- **Data Separation**: Clear distinction between regular customers and promotional subscribers

## 📊 Database Schema

### Tables Implemented:

1. **services** - Service catalog management
   - Fields: id, name, description, duration, price, category, active
   - Categories: Hair, Nails, Skincare, Makeup, Spa, Other

2. **staff** - Team member profiles
   - Fields: id, name, email, phone, specialties, bio, photo_url, active, working_hours
   - Includes specialty matching and scheduling information

3. **customers** - Customer database
   - Fields: id, name, email, phone, address, birth_date, notes, total_visits, total_spent
   - Tracks customer history and preferences

4. **appointments** - Booking management
   - Fields: id, customer_id, staff_id, service_id, date, time, duration, status, notes, price
   - Status options: scheduled, confirmed, in_progress, completed, cancelled, no_show

5. **business_settings** - Salon configuration
   - Fields: id, salon_name, address, phone, email, opening_hours, about_text, services_intro
   - Centralized business information management

6. **users** - Marketing/contact records (NOT a login table - no password is stored)
   - Fields: id, email, name, active, promotional_consent, promotional_signup_date, promotional_source, created_by
   - Written only via two SECURITY DEFINER SQL functions (`upsert_customer_account`,
     `is_promotional_subscriber`); never exposed directly to the anon key

Admin login is handled entirely by **Supabase Auth** (Authentication -> Users in
the Supabase dashboard) - there is no `role` column or in-app "make admin"
control, and no custom session table. Session tokens are managed by Supabase's
own auth service.

### User Types & Promotional System:

**Promotional Consent Types:**
- **Regular Customers**: Users created during booking without promotional consent
- **Promotional Subscribers**: Users who've consented to receive marketing offers
  - Booking signups: Consent given during service booking
  - Homepage signups: Dedicated promotional subscription via modal
  - Manual signups: Admin-created promotional subscribers

## 🚀 Supabase API Integration

The website uses Supabase PostgreSQL database with full REST API support:

### Database Configuration:
- **Supabase URL**: set in `js/config.js` after you create your own project (see Setup below)
- **REST API Base**: `/rest/v1/`
- **Authentication**: anon key for public reads/inserts; the logged-in admin's
  Supabase Auth session JWT for everything else, enforced via RLS policies
  (see `supabase-schema.sql`)
- **Custom Helper**: `SupabaseAPI` wrapper for common operations

### Available Operations:
- **GET /{table}** - List records with filtering and pagination
- **GET /{table}?id=eq.{id}** - Get single record by ID
- **POST /{table}** - Create new record
- **PATCH /{table}?id=eq.{id}** - Update record
- **DELETE /{table}?id=eq.{id}** - Delete record

### Helper Functions:
```javascript
SupabaseAPI.getAll('services')           // Get all services
SupabaseAPI.getById('services', id)      // Get service by ID
SupabaseAPI.create('services', data)     // Create new service
SupabaseAPI.update('services', id, data) // Update service
SupabaseAPI.delete('services', id)       // Delete service
SupabaseAPI.query('services', filters)   // Query with filters
```

## 📱 Mobile Responsiveness & Optimization

### **Complete Mobile Compatibility:**
- **Fully responsive design** using Tailwind CSS with custom mobile breakpoints
- **Mobile-first approach** with progressive enhancement for larger screens
- **Touch-friendly interface** with 44px+ minimum touch targets for all interactive elements
- **Optimized navigation** with enhanced mobile menu and hamburger/close icon transitions
- **Mobile-optimized layouts** for all pages including homepage, booking, and dashboard

### **Mobile-Specific Enhancements:**
- **Service Grid Optimization**: Single-column layout on mobile with proper spacing
- **Booking Flow Mobile**: Touch-friendly service selection and form interactions
- **Loading States**: Visual feedback for slow mobile connections
- **Error Handling**: Retry buttons and graceful fallbacks for network issues
- **Performance Optimization**: Lazy loading images and optimized JavaScript loading
- **iOS Compatibility**: Prevented unwanted zoom on form inputs with proper viewport settings

## 🎨 Design Features

### Visual Design:
- **Modern Purple/Blue Gradient Theme** throughout the application
- **Professional Typography** using Inter and Playfair Display fonts
- **Consistent Color Scheme** with purple primary, white backgrounds, gray text
- **Smooth Animations** and hover effects for better user experience
- **Card-Based Layouts** for clean, organized content presentation

### User Experience:
- **Intuitive Navigation** with clear visual hierarchy
- **Progressive Disclosure** in booking flow with step indicators
- **Real-time Feedback** with loading states and validation messages
- **Consistent Branding** across all pages and components

## 📈 Analytics & Reporting

The dashboard includes comprehensive analytics:

- **Daily Statistics**: Today's appointments, revenue, customer count
- **Historical Data**: Monthly revenue tracking and trends
- **Visual Charts**: Weekly appointment trends and service popularity
- **Customer Insights**: Visit history, spending patterns, contact information
- **Staff Performance**: Appointment distribution and specialties

## 🔧 Configuration Options

### Business Settings (Configurable via Dashboard):
- Salon name and branding
- Contact information (address, phone, email)
- Operating hours by day of week
- About us content and service descriptions
- Staff profiles and specialties
- Service catalog with pricing

## 🧪 Sample Data Included

The system comes pre-loaded with realistic sample data:
- **3 Staff Members** with different specialties and working hours
- **6 Beauty Services** across various categories with professional descriptions
- **3 Sample Customers** with realistic contact information
- **5 Sample Appointments** showing various statuses and scenarios
- **Complete Business Settings** for "Tina Beauty Studio Patong"
- **Admin Account** - create your own via Supabase Auth (not included in the sample data)
- **Row Level Security** locked down for customer PII (see supabase-schema.sql)

## ⭐ Key Highlights

1. **Complete Business Solution** - Not just a website, but a full business management system
2. **Supabase Auth Login** - admin authentication with no passwords stored in app tables
3. **Professional Design** - Modern, elegant design suitable for luxury beauty salons
4. **Mobile-First Approach** - Optimized for mobile users who book on-the-go
5. **Real-time Data Management** - All content is dynamically loaded and can be updated via dashboard
6. **Locked-Down PII** - customer/appointment data is write-only for the public site, readable only by an authenticated admin session
7. **Marketing Automation** - Promotional subscriber tracking with Gmail integration and CSV export
7. **Scalable Architecture** - Built with modern web standards and best practices
8. **No-Code Management** - Business owners can manage everything through the web interface

## 🚧 Features Not Yet Implemented

While the core system is complete and functional, these features could be added in future updates:

### Advanced Features:
- **Email Notifications** - Automated booking confirmations and reminders
- **SMS Integration** - Text message appointment reminders
- **Online Payments** - Credit card processing for advance booking payments
- **Calendar Integration** - Sync with Google Calendar or Outlook
- **Multi-location Support** - Manage multiple salon locations
- **Staff Schedule Management** - Advanced scheduling and availability management
- **Inventory Management** - Track products and supplies
- **Loyalty Program** - Customer rewards and point system
- **Online Store** - Sell beauty products online
- **Advanced Reporting** - Detailed financial and performance reports

### Technical Enhancements:
- **User Authentication** - Login system for customers and staff
- **Role-based Permissions** - Different access levels for staff and managers
- **Data Export** - Export customer and appointment data
- **Backup System** - Automated data backup and recovery
- **Multi-language Support** - Internationalization features
- **Advanced Search** - Full-text search across all data

## 🎯 Recommended Next Steps

1. **Email Integration** - Add automated email confirmations for bookings
2. **Enhanced Staff Management** - Add detailed scheduling and availability management
3. **Customer Portal** - Allow customers to view their booking history
4. **Advanced Analytics** - Add more detailed reporting and insights
5. **Payment Integration** - Add online payment processing
6. **Mobile App** - Create native mobile applications
7. **Social Media Integration** - Connect with Instagram, Facebook for marketing
8. **Review System** - Customer feedback and rating system

## 📞 Business Information

**Current Configuration:**
- **Business Name**: Tina Beauty Studio Patong
- **Address**: 123 Thaweewong Road, Patong Beach, Kathu, Phuket 83150, Thailand
- **Phone**: +66 76 123 456
- **Email**: hello@tinabeautystudio.com
- **WhatsApp**: +66 91 234 5678

All business information can be easily updated through the Settings tab in the management dashboard.

## 🚀 Setup Instructions

The site was originally exported from Genspark with a Supabase project that no
longer exists, plus a plaintext-password admin login and fully open database
policies. Both were rebuilt - see `HISTORY.md` for the full list of what changed.

1. **Create a Supabase project** at [supabase.com](https://supabase.com) (free tier is enough).
2. **Run `supabase-schema.sql`** in the Supabase SQL Editor (creates tables, RLS
   policies, the public availability view, and the two RPC functions).
3. **Run `supabase-sample-data.sql`** to load sample services/staff/customers/appointments.
4. **Create your admin account**: Supabase dashboard -> Authentication -> Users -> Add user.
5. **Get your API credentials**: Project Settings -> API -> copy the Project URL and `anon public` key.
6. **Paste them into `js/config.js`** (`SUPABASE_URL` and `SUPABASE_API_KEY`).
7. **Open `login.html`** and sign in with the admin account from step 4.

### Debug Tools (browser console):
```javascript
Config.debug();                    // Shows Supabase configuration
testApi();                         // Tests database connectivity
testAllTables();                   // Reports row counts per table
checkDatabaseSetup();              // Confirms the schema ran correctly
```

## Security Notes

This is a static site with no backend, so the public anon key is necessarily
visible in the page source - that's expected and safe as long as Row Level
Security is doing the real work:

- `services` / `staff`: public reads active rows only; all writes require an
  authenticated (admin) session.
- `customers` / `appointments`: public can only INSERT (booking); nothing
  public can read the data back. The homepage availability calendar reads a
  narrow `public_appointment_slots` view instead of the real table.
- `users` (marketing contacts): no public table access at all - the booking
  and promo-signup flows call two `SECURITY DEFINER` SQL functions instead.
- Admin login is Supabase Auth, not a custom table - no password is ever
  stored or compared inside this app's own database.

If you ever see `USING (true)` on a table holding customer data, or a plaintext
password comparison in JS, that's a regression - see `supabase-schema.sql` for
the intended policy set.
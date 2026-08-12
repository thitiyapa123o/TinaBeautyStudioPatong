// Booking System JavaScript for Glamour Beauty Salon

let currentStep = 1;
let selectedService = null;
let selectedDate = null;
let selectedTime = null;
let services = [];

// Initialize booking system
document.addEventListener('DOMContentLoaded', function() {
    // Set minimum date to today
    const dateInput = document.getElementById('appointment-date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    
    // Check for pre-selected service from URL first
    checkUrlParams();
    
    // Load initial data
    loadServices();
    
    // Set up event listeners
    setupEventListeners();
    
    // Set up promotional subscription check
    setupPromotionalCheck();
});

// Check URL parameters for pre-selected service
function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const serviceId = urlParams.get('service');
    if (serviceId) {
        console.log('Pre-selecting service from URL:', serviceId);
        // Store the service ID to auto-select after services load
        window.preSelectedServiceId = serviceId;
        // Flag that we came from a direct service link
        window.cameFromServiceLink = true;
    }
}

// Auto-select service after services are loaded
function autoSelectPreSelectedService() {
    if (window.preSelectedServiceId) {
        // Try multiple times in case of timing issues
        let attempts = 0;
        const maxAttempts = 10;
        
        const trySelect = () => {
            const serviceElement = document.querySelector(`[data-service-id="${window.preSelectedServiceId}"]`);
            if (serviceElement) {
                // Select the service
                serviceElement.click();
                console.log('Auto-selected service:', window.preSelectedServiceId);
                
                // Automatically advance to Step 2 (date/time selection)
                setTimeout(() => {
                    goToStep(2);
                    
                    // Update UI for direct service booking
                    const backText = document.getElementById('step2-back-text');
                    if (backText) {
                        backText.textContent = 'Back to Services';
                    }
                    
                    // Show service summary and update title
                    const service = services.find(s => s.id === serviceElement.dataset.serviceId);
                    if (service) {
                        // Update title
                        const titleElement = document.getElementById('step2-title');
                        if (titleElement) {
                            titleElement.innerHTML = `Book: <span class="text-purple-600">${service.name}</span>`;
                        }
                        
                        // Show service summary
                        const summaryElement = document.getElementById('service-summary');
                        const nameElement = document.getElementById('summary-service-name');
                        const detailsElement = document.getElementById('summary-service-details');
                        const priceElement = document.getElementById('summary-service-price');
                        
                        if (summaryElement && nameElement && detailsElement && priceElement) {
                            nameElement.textContent = service.name;
                            detailsElement.textContent = `${service.duration} minutes • ${service.category}`;
                            priceElement.textContent = `$${service.price}`;
                            summaryElement.classList.remove('hidden');
                        }
                    }
                    
                    console.log('Auto-advanced to Step 2');
                }, 200);
                
                // Clear the stored ID
                window.preSelectedServiceId = null;
                return true;
            } else if (attempts < maxAttempts) {
                attempts++;
                setTimeout(trySelect, 100);
            } else {
                console.warn('Could not find service element for ID:', window.preSelectedServiceId);
                window.preSelectedServiceId = null;
            }
        };
        
        trySelect();
    }
}

// Set up all event listeners
function setupEventListeners() {
    // Step navigation
    document.getElementById('step1-next').addEventListener('click', () => goToStep(2));
    document.getElementById('step2-back').addEventListener('click', handleStep2Back);
    document.getElementById('step2-next').addEventListener('click', () => goToStep(3));
    document.getElementById('step3-back').addEventListener('click', () => goToStep(2));
    document.getElementById('confirm-booking').addEventListener('click', confirmBooking);
    
    // Form validation
    document.getElementById('appointment-date').addEventListener('change', validateStep2);
    document.getElementById('appointment-time').addEventListener('change', validateStep2);
    document.getElementById('customer-name').addEventListener('input', validateStep2);
    document.getElementById('customer-email').addEventListener('input', validateStep2);
    document.getElementById('customer-phone').addEventListener('input', validateStep2);
}

// Handle Step 2 back button - go to homepage if came from service link
function handleStep2Back() {
    if (window.cameFromServiceLink) {
        // User came from homepage service link, go back to homepage
        window.location.href = 'index.html#services';
    } else {
        // Normal flow, go back to Step 1
        goToStep(1);
    }
}

// Load services from database
async function loadServices() {
    const loadingElement = document.getElementById('booking-services-loading');
    const servicesList = document.getElementById('services-list');
    
    console.log('🔄 Loading services for booking page...');
    console.log('📡 Supabase URL:', Config.SUPABASE_URL);
    
    try {
        // Test basic connection first
        console.log('🔍 Testing Supabase connection...');
        const testResponse = await fetch(Config.getApiUrl('test_connection'), {
            method: 'GET',
            headers: Config.getHeaders()
        });
        
        console.log('📊 Connection test response:', testResponse.status);
        
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout after 10 seconds')), 10000)
        );
        
        const dataPromise = SupabaseAPI.query('services', { active: true });
        const data = await Promise.race([dataPromise, timeoutPromise]);
        
        console.log('✅ Services loaded successfully:', data?.length || 0, 'services found');
        
        if (data) {
            services = data;
            
            // Hide loading state
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
            
            if (services.length === 0) {
                servicesList.innerHTML = '<div class="col-span-full text-center py-8"><p class="text-gray-600">No services available for booking at the moment.</p></div>';
                return;
            }
            
            renderServices();
            // Auto-select service if coming from URL parameter
            autoSelectPreSelectedService();
        } else {
            throw new Error('No services data received');
        }
    } catch (error) {
        console.error('Error loading services for booking:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            supabaseUrl: Config.getApiUrl('services')
        });
        
        // Hide loading state and show error
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
        
        if (servicesList) {
            servicesList.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <i class="fas fa-database text-red-500 text-3xl mb-4"></i>
                    <h3 class="text-lg font-semibold text-red-600 mb-2">Database Connection Issue</h3>
                    <p class="text-gray-600 mb-4">Unable to load services. This likely means the Supabase database needs to be set up.</p>
                    <div class="space-y-2 mb-4">
                        <button onclick="loadServices()" class="bg-purple-600 text-white px-6 py-3 rounded-full hover:bg-purple-700 transition">
                            <i class="fas fa-refresh mr-2"></i>Retry Loading
                        </button>
                        <button onclick="window.testApi()" class="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition ml-2">
                            <i class="fas fa-flask mr-2"></i>Test Database
                        </button>
                    </div>
                    <div class="text-xs text-gray-500 max-w-md mx-auto">
                        <p class="mb-2"><strong>To fix this:</strong></p>
                        <p>1. Go to your Supabase dashboard</p>
                        <p>2. Run the SQL setup scripts</p>
                        <p>3. Refresh this page</p>
                    </div>
                </div>
            `;
        }
    }
}

// Validate step 2 form fields
function validateStep2() {
    const date = document.getElementById('appointment-date').value;
    const time = document.getElementById('appointment-time').value;
    const name = document.getElementById('customer-name').value.trim();
    const email = document.getElementById('customer-email').value.trim();
    const phone = document.getElementById('customer-phone').value.trim();
    
    const isValid = date && time && name && email && phone;
    document.getElementById('step2-next').disabled = !isValid;
}

// Render services in step 1
function renderServices() {
    const servicesList = document.getElementById('services-list');
    
    servicesList.innerHTML = services.map(service => `
        <div class="service-option border-2 border-gray-200 rounded-lg p-6 cursor-pointer hover:shadow-lg transition-all duration-300"
             data-service-id="${service.id}" onclick="selectService('${service.id}')">
            <div class="flex items-center justify-between mb-4">
                <h3 class="font-playfair text-xl font-bold text-gray-800">${service.name}</h3>
                <span class="text-2xl font-bold text-purple-600">$${service.price}</span>
            </div>
            <p class="text-gray-600 mb-4">${service.description}</p>
            <div class="flex justify-between items-center text-sm text-gray-500">
                <span><i class="fas fa-clock mr-1"></i> ${service.duration} minutes</span>
                <span class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">${service.category}</span>
            </div>
        </div>
    `).join('');
}



// Select a service
function selectService(serviceId) {
    // Remove previous selection
    document.querySelectorAll('.service-option').forEach(el => {
        el.classList.remove('selected');
    });
    
    // Add selection to clicked service
    const selectedElement = document.querySelector(`[data-service-id="${serviceId}"]`);
    selectedElement.classList.add('selected');
    
    selectedService = services.find(s => s.id === serviceId);
    
    // Enable next button
    document.getElementById('step1-next').disabled = false;
}



// Navigate to specific step
function goToStep(step) {
    // Hide all steps
    document.querySelectorAll('.step-content').forEach(el => el.classList.add('hidden'));
    
    // Show current step
    document.getElementById(`step${step}`).classList.remove('hidden');
    
    // Update step indicators
    updateStepIndicators(step);
    
    // Handle step-specific logic
    if (step === 2) {
        // Store selected date and time when moving to step 2
        selectedDate = document.getElementById('appointment-date').value;
        selectedTime = document.getElementById('appointment-time').value;
    } else if (step === 3) {
        generateBookingSummary();
    }
    
    currentStep = step;
}

// Update step indicators
function updateStepIndicators(activeStep) {
    for (let i = 1; i <= 3; i++) {
        const indicator = document.getElementById(`step${i}-indicator`);
        const stepText = indicator.parentElement.querySelector('span');
        
        if (i <= activeStep) {
            indicator.classList.remove('bg-gray-300', 'text-gray-600');
            indicator.classList.add('bg-purple-600', 'text-white');
            stepText.classList.remove('text-gray-600');
            stepText.classList.add('text-purple-600');
            
            if (i < activeStep) {
                indicator.innerHTML = '<i class="fas fa-check"></i>';
            } else {
                indicator.textContent = i;
            }
        } else {
            indicator.classList.remove('bg-purple-600', 'text-white');
            indicator.classList.add('bg-gray-300', 'text-gray-600');
            stepText.classList.remove('text-purple-600');
            stepText.classList.add('text-gray-600');
            indicator.textContent = i;
        }
    }
}

// Generate booking summary for step 3
function generateBookingSummary() {
    selectedDate = document.getElementById('appointment-date').value;
    selectedTime = document.getElementById('appointment-time').value;
    
    const customerName = document.getElementById('customer-name').value;
    const customerEmail = document.getElementById('customer-email').value;
    const customerPhone = document.getElementById('customer-phone').value;
    const whatsappPreferred = document.getElementById('whatsapp-preferred').checked;
    const notes = document.getElementById('appointment-notes').value;
    
    const formatDate = new Date(selectedDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Convert 24-hour time to 12-hour format
    const timeDisplay = convertTo12Hour(selectedTime);
    
    const summary = `
        <div class="space-y-6">
            <div>
                <h3 class="font-semibold text-lg text-gray-800 mb-4">What You're Getting</h3>
                <div class="bg-white rounded-lg p-4 border">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <h4 class="font-semibold text-purple-600">${selectedService.name}</h4>
                            <p class="text-gray-600 text-sm">${selectedService.description}</p>
                        </div>
                        <span class="text-xl font-bold text-gray-800">$${selectedService.price}</span>
                    </div>
                    <div class="text-sm text-gray-500 mt-2">
                        <i class="fas fa-clock mr-1"></i> Duration: ${selectedService.duration} minutes
                    </div>
                </div>
            </div>
            
            <div>
                <h3 class="font-semibold text-lg text-gray-800 mb-4">When You're Coming</h3>
                <div class="bg-white rounded-lg p-4 border space-y-2">
                    <div class="flex items-center">
                        <i class="fas fa-calendar text-purple-600 w-5"></i>
                        <span class="ml-3"><strong>Date:</strong> ${formatDate}</span>
                    </div>
                    <div class="flex items-center">
                        <i class="fas fa-clock text-purple-600 w-5"></i>
                        <span class="ml-3"><strong>Preferred Time:</strong> ${timeDisplay}</span>
                    </div>
                    <div class="flex items-center">
                        <i class="fas fa-user-friends text-purple-600 w-5"></i>
                        <span class="ml-3"><strong>Staff:</strong> We'll assign the perfect person for you!</span>
                    </div>
                </div>
            </div>
            
            <div>
                <h3 class="font-semibold text-lg text-gray-800 mb-4">Your Contact Info</h3>
                <div class="bg-white rounded-lg p-4 border space-y-2">
                    <div><strong>Name:</strong> ${customerName}</div>
                    ${whatsappPreferred ? 
                        `<div><strong>Primary Contact:</strong> ${customerPhone} (WhatsApp preferred 📱)</div>
                         <div><strong>Backup Email:</strong> ${customerEmail}</div>` :
                        `<div><strong>Primary Contact:</strong> ${customerEmail} (Email)</div>
                         <div><strong>Phone:</strong> ${customerPhone}</div>`
                    }
                    ${notes ? `<div><strong>Special Notes:</strong> ${notes}</div>` : ''}
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('booking-summary').innerHTML = summary;
}

// Helper function to convert 24-hour to 12-hour format
function convertTo12Hour(time24) {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12}:${minutes} ${period}`;
}

// Confirm and create the booking request
async function confirmBooking() {
    const confirmButton = document.getElementById('confirm-booking');
    confirmButton.disabled = true;
    confirmButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Sending Request...';
    
    try {
        // First, create or get customer
        const whatsappPreferred = document.getElementById('whatsapp-preferred').checked;
        const phoneNumber = document.getElementById('customer-phone').value;

        // Generate the id client-side: the customers table has no public SELECT
        // policy (it holds PII), so an INSERT can't read the row back - we need
        // the id up front to link the appointment below.
        const customerData = {
            id: crypto.randomUUID(),
            name: document.getElementById('customer-name').value,
            email: document.getElementById('customer-email').value,
            phone: phoneNumber,
            whatsapp: whatsappPreferred ? phoneNumber : '',
            line_contact: document.getElementById('line-contact').value || '',
            address: '',
            birth_date: null,
            notes: '',
            total_visits: 0,
            total_spent: 0
        };

        // Create customer
        await SupabaseAPI.create('customers', customerData);
        const customer = customerData;

        // Handle user account creation and promotional consent
        // (upsert_customer_account is a SECURITY DEFINER RPC - the users table
        // itself has no public policies, see supabase-schema.sql)
        try {
            const promotionalConsent = document.getElementById('promotional-consent').checked;

            await SupabaseAPI.rpc('upsert_customer_account', {
                p_name: customerData.name,
                p_email: customerData.email,
                p_promotional_consent: promotionalConsent,
                p_source: 'booking'
            });
        } catch (error) {
            console.log('Note: Could not create user account:', error);
            // Don't fail the booking if user creation fails
        }

        // Create appointment request (status: requested)
        selectedDate = document.getElementById('appointment-date').value;
        selectedTime = document.getElementById('appointment-time').value;

        // Make sure time matches HH:MM:SS
        let timeValue = selectedTime;
        if (timeValue && timeValue.length === 5) {
          timeValue = timeValue + ':00'; // e.g. '14:30' → '14:30:00'
        }

        // Build the appointment data object to match Supabase schema exactly
        // (id generated client-side for the same reason as the customer above)
        const appointmentData = {
          id: crypto.randomUUID(),
          customer_id: customer.id,
          staff_id: null,
          service_id: selectedService.id,
          date: selectedDate,
          time: timeValue,
          duration: Number(selectedService.duration) || 60,
          status: 'requested',
          notes: document.getElementById('appointment-notes').value || '',
          price: selectedService.price ? Number(selectedService.price) : null
        };

        await SupabaseAPI.create('appointments', appointmentData);
        const appointment = appointmentData;

        if (appointment) {
            
            // Generate WhatsApp message
            await sendWhatsAppRequest(customer, selectedService, selectedDate, selectedTime, appointment);
            
            // Show success message
            document.getElementById('step3').classList.add('hidden');
            document.getElementById('success-message').classList.remove('hidden');
            
            // Show backend notification status
            setTimeout(() => {
                showBackendNotificationStatus();
            }, 1500);
        } else {
            throw new Error('Failed to create appointment request');
        }
        
    } catch (error) {
        console.error('Error creating booking request:', error);
        alert('There was an error submitting your request. Please try again.');
        confirmButton.disabled = false;
        confirmButton.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Send Request';
    }
}

// Send WhatsApp message to salon owner
async function sendWhatsAppRequest(customer, service, date, time, appointment) {
    try {
        // Get business settings for WhatsApp number
        const businessData = await SupabaseAPI.query('business_settings', { setting_key: 'main' });
        const business = businessData[0];
        
        if (!business || !business.whatsapp) {
            console.log('WhatsApp number not configured');
            return;
        }
        
        // Format the message
        const formatDate = new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const timeDisplay = convertTo12Hour(time);
        
        const whatsappMessage = `🌸 *New Booking Request* 🌸

📋 *Service Requested:* ${service.name}
💰 *Price:* $${service.price}
⏱️ *Duration:* ${service.duration} minutes

👤 *Customer Info:*
• Name: ${customer.name}
${customer.whatsapp ? 
    `• WhatsApp: ${customer.whatsapp} 📱` : 
    `• Phone: ${customer.phone}`
}
• Email: ${customer.email}
${customer.line_contact ? `• Line: ${customer.line_contact} 💬` : ''}

📅 *Preferred Appointment:*
• Date: ${formatDate}
• Time: ${timeDisplay}

${appointment.notes ? `📝 *Special Notes:* ${appointment.notes}` : ''}

*Request ID:* ${appointment.id}

${customer.whatsapp ? 
    'Customer prefers WhatsApp communication! Contact them via WhatsApp first for quickest response. 🚀' :
    'Please contact the customer via email to confirm. Phone contact also available.'
} Staff assignment can be handled internally. 💕`;
        
        // Create WhatsApp URL for backend processing
        const phoneNumber = business.whatsapp.replace(/\D/g, ''); // Remove non-digits
        const encodedMessage = encodeURIComponent(whatsappMessage);
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
        
        // Store notification for admin dashboard and prepare user instructions
        try {
            localStorage.setItem('newBookingNotification', JSON.stringify({
                timestamp: Date.now(),
                customerName: customer.name,
                serviceName: service.name,
                appointmentId: appointment.id,
                message: whatsappMessage,
                whatsappUrl: whatsappUrl
            }));
        } catch (error) {
            console.log('Could not store booking notification:', error);
        }
        
        // Prepare notification options for user
        window.bookingMessage = whatsappMessage;
        window.whatsappUrl = whatsappUrl;
        window.lineContact = customer.line_contact;
        
        console.log('Booking notification prepared for:', phoneNumber);
        
        // Set customer contact status for display
        window.customerHasContact = !!(customer.line_contact || customer.whatsapp);
        window.preferredContactMethod = customer.line_contact ? 'Line' : (customer.whatsapp ? 'WhatsApp' : null);
        
        // Backend WhatsApp messaging simulation
        await sendBackendWhatsAppNotification({
            businessWhatsApp: phoneNumber,
            customerInfo: customer,
            serviceInfo: service,
            appointmentInfo: appointment,
            bookingMessage: whatsappMessage
        });
        
        // Send confirmation to customer if they provided contact info
        if (window.customerHasContact) {
            await sendCustomerConfirmation(customer, service, appointment);
        }
        
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        // Don't show error to user since the appointment request was still created
    }
}

// Set up promotional consent checking
function setupPromotionalCheck() {
    const emailInput = document.getElementById('customer-email');
    const promotionalContainer = document.getElementById('promotional-consent-container');
    const promotionalCheckbox = document.getElementById('promotional-consent');
    
    if (emailInput && promotionalContainer && promotionalCheckbox) {
        // Check when email field loses focus
        emailInput.addEventListener('blur', async function() {
            const email = this.value.trim().toLowerCase();
            if (!email || !email.includes('@')) return;
            
            try {
                const result = await SupabaseAPI.rpc('is_promotional_subscriber', { check_email: email });
                const row = result && result[0];

                if (row && row.subscribed) {
                    // User already subscribed - disable and show message
                    promotionalCheckbox.checked = true;
                    promotionalCheckbox.disabled = true;
                    promotionalContainer.classList.add('opacity-75');
                    promotionalContainer.innerHTML = `
                        <i class="fas fa-check-circle text-green-600 mr-3 mt-1"></i>
                        <div>
                            <div class="text-sm font-semibold text-green-700">
                                ✅ You're already subscribed to our promotions!
                            </div>
                            <p class="text-xs text-green-600 mt-1">Signed up on ${new Date(row.signup_date).toLocaleDateString()} - You're all set for exclusive offers! 💖</p>
                        </div>
                    `;
                } else {
                    // Reset to normal state if not subscribed
                    promotionalCheckbox.checked = false;
                    promotionalCheckbox.disabled = false;
                    promotionalContainer.classList.remove('opacity-75');
                    promotionalContainer.innerHTML = `
                        <input type="checkbox" id="promotional-consent" name="promotional_consent" class="mt-1 mr-3 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500">
                        <div>
                            <label for="promotional-consent" class="text-sm font-semibold text-gray-700 cursor-pointer">
                                ✨ Yes! Keep me in the loop about special offers, new services & beauty tips!
                            </label>
                            <p class="text-xs text-gray-500 mt-1">Get exclusive access to promotions, seasonal discounts, and insider beauty secrets. We respect your privacy - unsubscribe anytime! 💖</p>
                        </div>
                    `;
                }
            } catch (error) {
                console.log('Could not check promotional status:', error);
            }
        });
    }
}

// Reset booking form to start over
function resetBookingForm() {
    // Reset all variables
    selectedService = null;
    selectedDate = null;
    selectedTime = null;
    
    // Clear form fields
    document.getElementById('appointment-date').value = '';
    document.getElementById('appointment-time').value = '';
    document.getElementById('customer-name').value = '';
    document.getElementById('customer-email').value = '';
    document.getElementById('customer-phone').value = '';
    document.getElementById('whatsapp-preferred').checked = false;
    document.getElementById('appointment-notes').value = '';
    
    // Hide success message and show first step
    document.getElementById('success-message').classList.add('hidden');
    goToStep(1);
    
    // Disable next buttons
    document.getElementById('step1-next').disabled = true;
    document.getElementById('step2-next').disabled = true;
    
    // Clear selections
    document.querySelectorAll('.service-option').forEach(el => {
        el.classList.remove('selected');
    });
}

// Show backend notification status
function showBackendNotificationStatus() {
    const successMessage = document.getElementById('success-message');
    if (successMessage) {
        const statusDiv = document.createElement('div');
        statusDiv.innerHTML = `
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <h4 class="font-semibold text-blue-800 mb-3">📱 Notifications Sent</h4>
                <div class="space-y-2 text-sm">
                    <div class="flex items-center text-green-700">
                        <i class="fas fa-check-circle mr-2"></i>
                        <span>Booking request sent to salon owner via WhatsApp</span>
                    </div>
                    ${window.customerHasContact ? `
                        <div class="flex items-center text-green-700">
                            <i class="fas fa-check-circle mr-2"></i>
                            <span>Confirmation sent to your ${window.preferredContactMethod}</span>
                        </div>
                    ` : ''}
                </div>
                <p class="text-xs text-blue-600 mt-3">
                    💡 The salon owner will contact you shortly to confirm your appointment details!
                </p>
            </div>
        `;
        successMessage.appendChild(statusDiv);
    }
}

// Helper function to copy Line message
function copyLineMessage() {
    if (window.bookingMessage) {
        navigator.clipboard.writeText(window.bookingMessage).then(() => {
            alert('📱 Booking message copied! Now you can:\n\n1. Open Line app\n2. Find your salon contact\n3. Paste and send the message\n\nYour booking request will be sent via Line! 💬');
        }).catch(() => {
            // Fallback for browsers that don't support clipboard API
            const textArea = document.createElement('textarea');
            textArea.value = window.bookingMessage;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                alert('📱 Message copied! Paste it in Line to send your booking request.');
            } catch (err) {
                prompt('Copy this message and send it via Line:', window.bookingMessage);
            }
            document.body.removeChild(textArea);
        });
    }
}

// Backend WhatsApp notification system (simulation)
async function sendBackendWhatsAppNotification(data) {
    try {
        console.log('🔄 Sending WhatsApp notification to business owner...');
        
        // In production, this would call a backend API endpoint
        // For now, we simulate the process and log the details
        
        const notificationPayload = {
            to: data.businessWhatsApp,
            message: data.bookingMessage,
            type: 'booking_notification',
            timestamp: Date.now()
        };
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('✅ WhatsApp notification sent successfully');
        console.log('📱 Notification details:', notificationPayload);
        
        // Store notification in local storage for demonstration
        try {
            const notifications = JSON.parse(localStorage.getItem('sentNotifications') || '[]');
            notifications.push(notificationPayload);
            localStorage.setItem('sentNotifications', JSON.stringify(notifications));
        } catch (error) {
            console.log('Could not store notification locally:', error);
        }
        
        return { success: true, messageId: 'msg_' + Date.now() };
        
    } catch (error) {
        console.error('❌ Failed to send WhatsApp notification:', error);
        throw error;
    }
}

// Send confirmation message to customer
async function sendCustomerConfirmation(customer, service, appointment) {
    try {
        const confirmationMessage = `🌸 Thank you for your booking request!

📋 Service: ${service.name}
📅 Date: ${new Date(appointment.date).toLocaleDateString()}
⏰ Time: ${appointment.time}

We'll contact you shortly to confirm your appointment. 

Have a beautiful day! 💖
- Tina Beauty Studio Patong`;

        // Prioritize Line if provided, otherwise use WhatsApp
        if (customer.line_contact) {
            console.log('🔄 Sending Line confirmation to customer...');
            await sendLineMessage(customer.line_contact, confirmationMessage);
        } else if (customer.whatsapp) {
            console.log('🔄 Sending WhatsApp confirmation to customer...');
            await sendWhatsAppMessage(customer.whatsapp, confirmationMessage);
        } else {
            console.log('ℹ️ No messaging contact provided by customer - skipping confirmation');
            return;
        }
        
    } catch (error) {
        console.error('❌ Failed to send customer confirmation:', error);
        // Don't throw error - confirmation is optional
    }
}

// WhatsApp message sending (simulation)
async function sendWhatsAppMessage(phoneNumber, message) {
    const payload = {
        to: phoneNumber,
        message: message,
        type: 'customer_confirmation',
        timestamp: Date.now()
    };
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('✅ WhatsApp confirmation sent to customer:', phoneNumber);
    console.log('📱 Message:', message);
    
    return { success: true, messageId: 'customer_' + Date.now() };
}

// Line message sending (simulation)
async function sendLineMessage(lineContact, message) {
    const payload = {
        to: lineContact,
        message: message,
        type: 'customer_confirmation',
        platform: 'line',
        timestamp: Date.now()
    };
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('✅ Line confirmation sent to customer:', lineContact);
    console.log('💬 Message:', message);
    
    return { success: true, messageId: 'line_' + Date.now() };
}

// Initialize booking system when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadServices();
    setupPromotionalCheck();
    
    // Check if service is pre-selected via URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const serviceId = urlParams.get('service');
    if (serviceId) {
        // Wait a bit for services to load, then select the service
        setTimeout(() => {
            const serviceCards = document.querySelectorAll('.service-option');
            serviceCards.forEach(card => {
                if (card.dataset.serviceId === serviceId) {
                    card.click();
                }
            });
        }, 1000);
    }
});
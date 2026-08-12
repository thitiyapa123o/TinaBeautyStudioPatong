// Main JavaScript for Glamour Beauty Salon Website

// Mobile menu toggle
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const menuButton = document.querySelector('.md\\:hidden button');
    const menuIcon = menuButton.querySelector('i');
    
    mobileMenu.classList.toggle('hidden');
    
    // Toggle hamburger/close icon
    if (mobileMenu.classList.contains('hidden')) {
        menuIcon.className = 'fas fa-bars text-xl';
    } else {
        menuIcon.className = 'fas fa-times text-xl';
    }
}

// Close mobile menu when clicking on links
function closeMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const menuButton = document.querySelector('.md\\:hidden button');
    const menuIcon = menuButton.querySelector('i');
    
    mobileMenu.classList.add('hidden');
    menuIcon.className = 'fas fa-bars text-xl';
}

// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    // Add smooth scrolling to all navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
            // Close mobile menu if open
            document.getElementById('mobileMenu').classList.add('hidden');
        });
    });

    // Load dynamic content
    loadBusinessInfo();
    loadServices();
    loadTeamMembers();
    loadBookingCalendar();
});

// Load business information from database
async function loadBusinessInfo() {
    try {
        const data = await SupabaseAPI.query('business_settings', { setting_key: 'main' });
        
        if (data && data.length > 0) {
            const businessInfo = data[0];
            
            // Update about section
            const aboutContent = document.getElementById('about-content');
            if (aboutContent) {
                aboutContent.innerHTML = businessInfo.about_text;
            }
            
            // Update contact information
            const contactInfo = document.getElementById('contact-info');
            if (contactInfo) {
                const openingHours = JSON.parse(businessInfo.opening_hours || '{}');
                contactInfo.innerHTML = `
                    <div>
                        <h3 class="font-playfair text-2xl font-bold text-gray-800 mb-6">Get in Touch</h3>
                        
                        <div class="space-y-6">
                            <div class="flex items-center">
                                <div class="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mr-4">
                                    <i class="fas fa-map-marker-alt text-purple-600"></i>
                                </div>
                                <div class="flex-1">
                                    <div class="font-semibold text-gray-800">Address</div>
                                    <div class="text-gray-600">${businessInfo.address}</div>
                                    <a href="https://share.google/CEdNG8piyu530Q0kZ" target="_blank" class="inline-flex items-center text-purple-600 hover:text-purple-800 text-sm mt-2 transition">
                                        <i class="fab fa-google mr-2"></i>Find us on Google Maps
                                    </a>
                                </div>
                            </div>
                            
                            <div class="flex items-center">
                                <div class="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mr-4">
                                    <i class="fas fa-phone text-purple-600"></i>
                                </div>
                                <div>
                                    <div class="font-semibold text-gray-800">Phone</div>
                                    <div class="text-gray-600">${businessInfo.phone}</div>
                                </div>
                            </div>
                            
                            <div class="flex items-center">
                                <div class="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mr-4">
                                    <i class="fas fa-envelope text-purple-600"></i>
                                </div>
                                <div>
                                    <div class="font-semibold text-gray-800">Email</div>
                                    <div class="text-gray-600">${businessInfo.email}</div>
                                </div>
                            </div>
                            
                            <div class="flex items-start">
                                <div class="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mr-4">
                                    <i class="fas fa-clock text-purple-600"></i>
                                </div>
                                <div>
                                    <div class="font-semibold text-gray-800">Opening Hours</div>
                                    <div class="text-gray-600 space-y-1">
                                        ${Object.entries(openingHours).map(([day, hours]) => 
                                            `<div>${capitalizeFirst(day)}: ${hours}</div>`
                                        ).join('')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
            
            // Update footer contact
            const footerContact = document.getElementById('footer-contact');
            if (footerContact) {
                footerContact.innerHTML = `
                    <div>
                        <h4 class="font-semibold text-lg mb-6">Contact Info</h4>
                        <ul class="space-y-3">
                            <li class="text-gray-400">
                                <i class="fas fa-map-marker-alt mr-2"></i>
                                ${businessInfo.address}
                            </li>
                            <li class="text-gray-400">
                                <i class="fas fa-phone mr-2"></i>
                                ${businessInfo.phone}
                            </li>
                            <li class="text-gray-400">
                                <i class="fas fa-envelope mr-2"></i>
                                ${businessInfo.email}
                            </li>
                        </ul>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('Error loading business information:', error);
    }
}

// Load services from database
async function loadServices() {
    try {
        console.log('Loading services from Supabase...');
        const data = await SupabaseAPI.query('services', { active: true });
        
        const servicesGrid = document.getElementById('services-grid');
        const loadingElement = document.getElementById('services-loading');
        
        if (servicesGrid && data) {
            const activeServices = data;
            
            // Hide loading state
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
            
            if (activeServices.length === 0) {
                servicesGrid.innerHTML = '<div class="col-span-full text-center py-12"><p class="text-gray-600">No services available at the moment. Please check back soon!</p></div>';
                return;
            }
            
            servicesGrid.innerHTML = activeServices.map(service => `
                <div class="service-card bg-white rounded-lg elegant-shadow hover:shadow-2xl transition-all duration-500 overflow-hidden">
                    <div class="relative h-48 overflow-hidden">
                        <img src="${service.image_url}" alt="${service.name}" class="w-full h-full object-cover transition-transform duration-500 hover:scale-110" loading="lazy">
                        <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                        <div class="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                            <span class="font-bold text-transparent bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-lg">$${service.price}</span>
                        </div>
                    </div>
                    <div class="p-8">
                        <h3 class="font-playfair text-xl font-bold text-gray-800 mb-4">${service.name}</h3>
                        <p class="text-gray-600 mb-6 leading-relaxed">${service.description}</p>
                        <div class="flex justify-between items-center text-sm text-gray-500 mb-6">
                            <span class="flex items-center">
                                <i class="fas fa-clock mr-2 text-fuchsia-500"></i> 
                                ${service.duration} minutes
                            </span>
                            <span class="bg-fuchsia-50 text-fuchsia-700 px-3 py-1 rounded-full text-xs font-semibold">
                                ${service.category}
                            </span>
                        </div>
                        <a href="booking.html?service=${service.id}" class="btn-primary text-white px-6 py-3 rounded-full hover:shadow-lg inline-block w-full text-center font-semibold">
                            <i class="fas fa-sparkles mr-2"></i>
                            Book This Vibe
                        </a>
                    </div>
                </div>
            `).join('');
        } else {
            // Hide loading state even if no data
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
            servicesGrid.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
                        <i class="fas fa-exclamation-triangle text-yellow-600 text-3xl mb-3"></i>
                        <h3 class="text-lg font-semibold text-yellow-800 mb-2">Database Setup Required</h3>
                        <p class="text-yellow-700 text-sm mb-4">
                            The website database needs to be configured. Please run the SQL scripts in your Supabase dashboard.
                        </p>
                        <button onclick="window.testApi()" class="bg-yellow-600 text-white px-4 py-2 rounded text-sm hover:bg-yellow-700">
                            Test Database Connection
                        </button>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading services:', error);
        console.error('Full error details:', {
            message: error.message,
            stack: error.stack,
            url: window.location.href,
            supabaseUrl: Config.getApiUrl('services')
        });
        
        // Check if it's a database setup issue
        if (error.message.includes('relation "services" does not exist') || error.message.includes('404')) {
            console.error('❌ SUPABASE DATABASE NOT SET UP!');
            console.error('📋 Please run the SQL scripts in your Supabase dashboard');
            console.error('📖 See SUPABASE_SETUP_INSTRUCTIONS.md for details');
        }
        
        // Hide loading state and show error
        const servicesGrid = document.getElementById('services-grid');
        const loadingElement = document.getElementById('services-loading');
        
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
        
        if (servicesGrid) {
            servicesGrid.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <i class="fas fa-exclamation-triangle text-red-500 text-3xl mb-4"></i>
                    <p class="text-gray-600 mb-4">Unable to load services at the moment.</p>
                    <button onclick="loadServices()" class="bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700 transition">
                        <i class="fas fa-refresh mr-2"></i>Try Again
                    </button>
                </div>
            `;
        }
    }
}

// Load team members from database
async function loadTeamMembers() {
    try {
        const data = await SupabaseAPI.query('staff', { active: true });
        
        const teamGrid = document.getElementById('team-grid');
        if (teamGrid && data) {
            const activeStaff = data;
            
            teamGrid.innerHTML = activeStaff.map(member => `
                <div class="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-all duration-300">
                    <div class="w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mx-auto mb-6 flex items-center justify-center">
                        ${member.photo_url ? 
                            `<img src="${member.photo_url}" alt="${member.name}" class="w-full h-full object-cover rounded-full" loading="lazy">` :
                            `<i class="fas fa-user text-white text-4xl"></i>`
                        }
                    </div>
                    <h3 class="font-playfair text-xl font-bold text-gray-800 mb-2">${member.name}</h3>
                    <div class="text-purple-600 mb-4">${member.specialties.join(', ')}</div>
                    <p class="text-gray-600 mb-6">${member.bio}</p>
                    <div class="flex justify-center space-x-4">
                        <a href="mailto:${member.email}" class="text-purple-600 hover:text-purple-800 transition">
                            <i class="fas fa-envelope"></i>
                        </a>
                        <a href="tel:${member.phone}" class="text-purple-600 hover:text-purple-800 transition">
                            <i class="fas fa-phone"></i>
                        </a>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading team members:', error);
    }
}

// Helper function to get service icon based on category
function getServiceIcon(category) {
    const icons = {
        'Hair': 'fa-cut',
        'Nails': 'fa-hand-paper',
        'Skincare': 'fa-leaf',
        'Makeup': 'fa-palette',
        'Spa': 'fa-spa',
        'Other': 'fa-star'
    };
    return icons[category] || 'fa-star';
}

// Helper function to capitalize first letter
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Contact form submission (placeholder - you can implement email sending)
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('#contact form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Thank you for your message! We will get back to you soon.');
            this.reset();
        });
    }
});

// Load booking calendar
async function loadBookingCalendar() {
    try {
        // appointments has no public SELECT policy (it holds customer data via FK) -
        // the calendar instead reads public_appointment_slots, a view exposing only
        // date/time/status/service/staff, see supabase-schema.sql
        const [appointmentsData, staffData, servicesData] = await Promise.all([
            SupabaseAPI.getAll('public_appointment_slots'),
            SupabaseAPI.getAll('staff'),
            SupabaseAPI.getAll('services')
        ]);
        
        if (appointmentsData && staffData && servicesData) {
            renderBookingCalendar(appointmentsData, staffData, servicesData);
        }
    } catch (error) {
        console.error('Error loading booking calendar:', error);
    }
}

// Render booking calendar
function renderBookingCalendar(appointments, staff, services) {
    const calendarContainer = document.getElementById('booking-calendar');
    if (!calendarContainer) return;
    
    // Generate next 7 days
    const today = new Date();
    const next7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        return date;
    });
    
    const calendar = next7Days.map(date => {
        const dateStr = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dayNumber = date.getDate();
        const monthName = date.toLocaleDateString('en-US', { month: 'short' });
        
        // Get appointments for this date
        const dayAppointments = appointments.filter(apt => 
            new Date(apt.date).toISOString().split('T')[0] === dateStr
        );
        
        // Generate time slots (10:00 to 20:00)
        const timeSlots = [];
        for (let hour = 10; hour <= 19; hour++) {
            const timeStr = `${hour.toString().padStart(2, '0')}:00`;
            const bookedApt = dayAppointments.find(apt => apt.time === timeStr);
            
            let status = 'available';
            let details = '';
            
            if (bookedApt) {
                const service = services.find(s => s.id === bookedApt.service_id);
                const staffMember = staff.find(s => s.id === bookedApt.staff_id);
                
                if (bookedApt.status === 'requested') {
                    status = 'requested';
                    details = `${service?.name || 'Service'} (Pending)`;
                } else if (['scheduled', 'confirmed', 'in_progress'].includes(bookedApt.status)) {
                    status = 'booked';
                    details = `${service?.name || 'Service'} - ${staffMember?.name || 'Staff'}`;
                }
            }
            
            timeSlots.push({ time: timeStr, status, details });
        }
        
        return {
            date: dateStr,
            dayName,
            dayNumber,
            monthName,
            timeSlots
        };
    });
    
    calendarContainer.innerHTML = calendar.map(day => `
        <div class="bg-gray-50 rounded-lg p-4 min-h-96">
            <div class="text-center mb-4">
                <div class="font-semibold text-gray-800">${day.dayName}</div>
                <div class="text-2xl font-bold text-transparent bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text">${day.dayNumber}</div>
                <div class="text-sm text-gray-600">${day.monthName}</div>
            </div>
            
            <div class="space-y-2">
                ${day.timeSlots.map(slot => `
                    <div class="flex items-center justify-between text-sm p-2 rounded ${
                        slot.status === 'available' ? 'bg-green-100 text-green-800' :
                        slot.status === 'booked' ? 'bg-purple-100 text-purple-800' :
                        'bg-orange-100 text-orange-800'
                    }" title="${slot.details}">
                        <span class="font-medium">${slot.time}</span>
                        <div class="w-3 h-3 rounded-full ${
                            slot.status === 'available' ? 'bg-green-500' :
                            slot.status === 'booked' ? 'bg-purple-500' :
                            'bg-orange-500'
                        }"></div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// Add scroll effect to navigation
window.addEventListener('scroll', function() {
    const nav = document.querySelector('nav');
    if (window.scrollY > 100) {
        nav.classList.add('shadow-xl');
        nav.classList.remove('shadow-lg');
    } else {
        nav.classList.remove('shadow-xl');
        nav.classList.add('shadow-lg');
    }
});

// Promotional Modal Functions
function showPromotionalModal() {
    document.getElementById('promotional-modal').classList.remove('hidden');
}

function closePromotionalModal() {
    document.getElementById('promotional-modal').classList.add('hidden');
    document.getElementById('promotional-signup-form').reset();
}

// Setup promotional modal
function setupPromotionalModal() {
    const form = document.getElementById('promotional-signup-form');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const name = formData.get('name');
            const email = formData.get('email');
            const phone = formData.get('phone') || '';
            
            try {
                // Check if this email is already subscribed (upsert_customer_account and
                // is_promotional_subscriber are SECURITY DEFINER RPCs - the users table
                // itself has no public policies, see supabase-schema.sql)
                const result = await SupabaseAPI.rpc('is_promotional_subscriber', { check_email: email });
                const row = result && result[0];

                if (row && row.subscribed) {
                    alert('🎉 You\'re already subscribed to our promotions! Check your email for exclusive offers.');
                } else {
                    await SupabaseAPI.rpc('upsert_customer_account', {
                        p_name: name,
                        p_email: email,
                        p_promotional_consent: true,
                        p_source: 'homepage'
                    });

                    alert('🎊 Welcome to the VIP club! You\'re now signed up for exclusive beauty offers and tips. Your inbox is about to get a lot more beautiful!');
                }

                closePromotionalModal();
            } catch (error) {
                console.error('Error signing up for promotions:', error);
                alert('Oops! Something went wrong. Please try again or contact us directly.');
            }
        });
        
        // Add click outside to close
        document.getElementById('promotional-modal').addEventListener('click', function(e) {
            if (e.target === this) {
                closePromotionalModal();
            }
        });
    }
}

// Initialize promotional modal when page loads
document.addEventListener('DOMContentLoaded', function() {
    setupPromotionalModal();
});

// Export functions for global use
window.showPromotionalModal = showPromotionalModal;
window.closePromotionalModal = closePromotionalModal;
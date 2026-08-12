// Dashboard JavaScript for Glamour Beauty Salon

let currentTab = 'overview';
let appointments = [];
let customers = [];
let services = [];
let staff = [];
let users = [];
let businessSettings = null;
let appointmentsChart = null;
let servicesChart = null;

// Handle staff edit form submission
function setupStaffFormListener() {
    const staffEditForm = document.getElementById('staff-edit-form');
    if (staffEditForm) {
        staffEditForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const staffId = document.getElementById('edit-staff-id').value;
            const formData = new FormData(e.target);
            
            // Get selected specialties
            const specialties = [];
            const specialtyCheckboxes = document.querySelectorAll('input[name="specialties"]:checked');
            specialtyCheckboxes.forEach(checkbox => {
                specialties.push(checkbox.value);
            });
            
            let workingHours = formData.get('working_hours') || '{}';
            try {
                workingHours = JSON.parse(workingHours);
            } catch (e) {
                alert('Working hours must be valid JSON, e.g. {"monday": "10:00-18:00"}');
                return;
            }

            const staffData = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                photo_url: formData.get('photo_url') || '',
                bio: formData.get('bio'),
                working_hours: workingHours,
                active: document.getElementById('edit-staff-active').checked,
                specialties: specialties
            };

            showLoading(true);

            try {
                const updatedStaff = await SupabaseAPI.update('staff', staffId, staffData);

                if (updatedStaff) {
                    // Update local staff array
                    const staffIndex = staff.findIndex(s => s.id === staffId);
                    if (staffIndex !== -1) {
                        staff[staffIndex] = updatedStaff;
                    }

                    // Refresh the staff list
                    renderStaffList();

                    // Close modal
                    closeStaffModal();

                    alert('Staff member updated successfully!');
                } else {
                    throw new Error('Failed to update staff member');
                }
            } catch (error) {
                console.error('Error updating staff member:', error);
                alert('Error updating staff member. Please try again.');
            } finally {
                showLoading(false);
            }
        });
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async function() {
    // Check admin access before loading dashboard
    const authorized = await requireAdmin();
    if (!authorized) {
        return;
    }

    loadAllData();
    setupEventListeners();
    setupServiceFormListener();
    setupStaffFormListener();
    setupUserFormListener();
    setupAppointmentFormListener();
});

// Set up event listeners
function setupEventListeners() {
    // Appointment filter
    document.getElementById('appointment-filter').addEventListener('change', filterAppointments);
    
    // Customer search
    document.getElementById('customer-search').addEventListener('input', searchCustomers);
    
    // Settings form
    document.getElementById('settings-form').addEventListener('submit', saveSettings);
    
    // Service edit form (added in DOMContentLoaded event in the service management section)
    // Staff edit form (added in DOMContentLoaded event in the staff management section)
}

// Show/hide tabs
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // Show selected tab
    document.getElementById(tabName + '-tab').classList.remove('hidden');
    
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    event.target.classList.add('active');
    
    currentTab = tabName;
    
    // Load tab-specific data
    if (tabName === 'overview') {
        loadOverviewData();
        // Ensure charts are properly sized after tab visibility
        setTimeout(() => {
            if (appointmentsChart) appointmentsChart.resize();
            if (servicesChart) servicesChart.resize();
        }, 100);
    } else if (tabName === 'appointments') {
        renderAppointmentsList();
    } else if (tabName === 'customers') {
        renderCustomersList();
    } else if (tabName === 'services') {
        renderServicesList();
    } else if (tabName === 'staff') {
        renderStaffList();
    } else if (tabName === 'users') {
        renderUsersList();
    } else if (tabName === 'promotions') {
        renderPromotionalSubscribers();
    } else if (tabName === 'settings') {
        loadSettings();
    }
}

// Load all data from database
async function loadAllData() {
    showLoading(true);
    
    try {
        // Load all data concurrently
        const [appointmentsData, customersData, servicesData, staffData, usersData, settingsData] = await Promise.all([
            SupabaseAPI.getAll('appointments'),
            SupabaseAPI.getAll('customers'),
            SupabaseAPI.getAll('services'),
            SupabaseAPI.getAll('staff'),
            SupabaseAPI.getAll('users'),
            SupabaseAPI.query('business_settings', { setting_key: 'main' })
        ]);
        
        appointments = appointmentsData || [];
        customers = customersData || [];
        services = servicesData || [];
        staff = staffData || [];
        users = usersData || [];
        businessSettings = (settingsData || [])[0];
        
        // Load initial overview
        loadOverviewData();
        
    } catch (error) {
        console.error('Error loading data:', error);
    } finally {
        showLoading(false);
    }
}

// Load overview statistics and charts
function loadOverviewData() {
    calculateStatistics();
    renderTodaySchedule();
    renderCharts();
}

// Calculate and display statistics
function calculateStatistics() {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Today's appointments
    const todayAppointments = appointments.filter(apt => 
        new Date(apt.date).toISOString().split('T')[0] === today
    );
    
    // Today's revenue
    const todayRevenue = todayAppointments
        .filter(apt => apt.status === 'completed')
        .reduce((sum, apt) => sum + apt.price, 0);
    
    // This month's revenue
    const monthRevenue = appointments
        .filter(apt => {
            const aptDate = new Date(apt.date);
            return aptDate.getMonth() === currentMonth && 
                   aptDate.getFullYear() === currentYear &&
                   apt.status === 'completed';
        })
        .reduce((sum, apt) => sum + apt.price, 0);
    
    // Update UI
    document.getElementById('today-appointments').textContent = todayAppointments.length;
    document.getElementById('today-revenue').textContent = `$${todayRevenue.toFixed(2)}`;
    document.getElementById('total-customers').textContent = customers.length;
    document.getElementById('month-revenue').textContent = `$${monthRevenue.toFixed(2)}`;
}

// Render today's schedule
function renderTodaySchedule() {
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments
        .filter(apt => new Date(apt.date).toISOString().split('T')[0] === today)
        .sort((a, b) => a.time.localeCompare(b.time));
    
    const scheduleContainer = document.getElementById('today-schedule');
    
    if (todayAppointments.length === 0) {
        scheduleContainer.innerHTML = '<p class="text-gray-500 text-center py-8">No appointments scheduled for today</p>';
        return;
    }
    
    scheduleContainer.innerHTML = todayAppointments.map(apt => {
        const customer = customers.find(c => c.id === apt.customer_id);
        const service = services.find(s => s.id === apt.service_id);
        const staffMember = staff.find(s => s.id === apt.staff_id);
        const staffDisplay = staffMember ? staffMember.name :
                           !apt.staff_id ? 'Not Assigned' : 'Unknown Staff';
        
        return `
            <div class="appointment-card flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div class="flex items-center space-x-4">
                    <div class="text-center">
                        <div class="text-sm font-semibold text-gray-800">${apt.time}</div>
                        <div class="text-xs text-gray-500">${apt.duration}min</div>
                    </div>
                    <div>
                        <h4 class="font-semibold text-gray-800">${customer?.name || 'Unknown Customer'}</h4>
                        <p class="text-sm text-gray-600">${service?.name || 'Unknown Service'}</p>
                        <p class="text-xs text-gray-500">with ${staffDisplay}</p>
                    </div>
                </div>
                <div class="text-right">
                    <span class="status-${apt.status} text-white text-xs px-3 py-1 rounded-full">${capitalizeFirst(apt.status.replace('_', ' '))}</span>
                    <div class="text-sm font-semibold text-gray-800 mt-1">$${apt.price}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Render charts
function renderCharts() {
    // Add small delay to ensure DOM is ready and containers are properly sized
    setTimeout(() => {
        renderAppointmentsChart();
        renderServicesChart();
    }, 50);
}

// Render weekly appointments chart
function renderAppointmentsChart() {
    const ctx = document.getElementById('appointmentsChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (appointmentsChart) {
        appointmentsChart.destroy();
    }
    
    // Get last 7 days data
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
    }).reverse();
    
    const appointmentCounts = last7Days.map(date => 
        appointments.filter(apt => new Date(apt.date).toISOString().split('T')[0] === date).length
    );
    
    const labels = last7Days.map(date => 
        new Date(date).toLocaleDateString('en-US', { weekday: 'short' })
    );
    
    appointmentsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Appointments',
                data: appointmentCounts,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 10
                    }
                }
            }
        }
    });
}

// Render services popularity chart
function renderServicesChart() {
    const ctx = document.getElementById('servicesChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (servicesChart) {
        servicesChart.destroy();
    }
    
    // Count appointments per service
    const serviceCounts = services.map(service => ({
        name: service.name,
        count: appointments.filter(apt => apt.service_id === service.id).length
    })).filter(item => item.count > 0);
    
    const labels = serviceCounts.map(item => item.name);
    const data = serviceCounts.map(item => item.count);
    const colors = [
        '#667eea', '#764ba2', '#f093fb', '#f5576c',
        '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'
    ];
    
    servicesChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, data.length),
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 8,
                        font: {
                            size: 11
                        }
                    }
                }
            },
            cutout: '60%'
        }
    });
}

// Render appointments list
function renderAppointmentsList(filteredAppointments = null) {
    const appointmentsToShow = filteredAppointments || appointments;
    const appointmentsList = document.getElementById('appointments-list');
    
    if (appointmentsToShow.length === 0) {
        appointmentsList.innerHTML = '<p class="text-gray-500 text-center py-8">No appointments found</p>';
        return;
    }
    
    appointmentsList.innerHTML = appointmentsToShow
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(apt => {
            const customer = customers.find(c => c.id === apt.customer_id);
            const service = services.find(s => s.id === apt.service_id);
            const staffMember = staff.find(s => s.id === apt.staff_id);
            const appointmentDate = new Date(apt.date).toLocaleDateString();
            
            // Handle unassigned staff
            const staffDisplay = staffMember ? staffMember.name :
                                !apt.staff_id ? 'Not Assigned Yet' : 'Unknown Staff';
            
            return `
                <div class="appointment-card border border-gray-200 rounded-lg p-4">
                    <div class="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                        <div>
                            <div class="font-semibold text-gray-800">${appointmentDate}</div>
                            <div class="text-sm text-gray-600">${apt.time}</div>
                        </div>
                        <div>
                            <div class="font-semibold text-gray-800">${customer?.name || 'Unknown'}</div>
                            <div class="text-sm text-gray-600">${customer?.phone || ''}</div>
                        </div>
                        <div>
                            <div class="text-gray-800">${service?.name || 'Unknown Service'}</div>
                            <div class="text-sm text-gray-600">${apt.duration}min</div>
                        </div>
                        <div>
                            <div class="text-gray-800">${staffDisplay}</div>
                            ${!apt.staff_id ?
                                '<div class="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">⚠️ Needs Staff Assignment</div>' : 
                                staffMember && !staffMember.active ? 
                                '<div class="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">⚠️ Staff Inactive</div>' : 
                                '<div class="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">✓ Assigned</div>'
                            }
                        </div>
                        <div class="text-center">
                            <span class="status-${apt.status} text-white text-xs px-3 py-1 rounded-full">
                                ${capitalizeFirst(apt.status.replace('_', ' '))}
                            </span>
                        </div>
                        <div class="text-right">
                            <div class="font-semibold text-gray-800">$${apt.price}</div>
                            <div class="flex justify-end space-x-2 mt-2">
                                <button onclick="editAppointmentStatus('${apt.id}')" class="text-blue-600 hover:text-blue-800 text-sm">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="deleteAppointment('${apt.id}')" class="text-red-600 hover:text-red-800 text-sm">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
}

// Filter appointments by status
function filterAppointments() {
    const status = document.getElementById('appointment-filter').value;
    const filteredAppointments = status ? 
        appointments.filter(apt => apt.status === status) : 
        appointments;
    renderAppointmentsList(filteredAppointments);
}

// Render customers list
function renderCustomersList(filteredCustomers = null) {
    const customersToShow = filteredCustomers || customers;
    const customersList = document.getElementById('customers-list');
    
    if (customersToShow.length === 0) {
        customersList.innerHTML = '<p class="text-gray-500 text-center py-8">No customers found</p>';
        return;
    }
    
    customersList.innerHTML = `
        <table class="min-w-full">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visits</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Spent</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Visit</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
                ${customersToShow.map(customer => {
                    const customerAppointments = appointments.filter(apt => apt.customer_id === customer.id);
                    const lastVisit = customerAppointments.length > 0 ? 
                        new Date(Math.max(...customerAppointments.map(apt => new Date(apt.date)))).toLocaleDateString() : 
                        'Never';
                    
                    return `
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="font-medium text-gray-900">${customer.name}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-gray-900">${customer.email}</div>
                                <div class="text-gray-500">📞 ${customer.phone}</div>
                                ${customer.whatsapp ? `<div class="text-green-600 text-sm">📱 ${customer.whatsapp}</div>` : ''}
                                ${customer.line_contact ? `<div class="text-green-500 text-sm">💬 ${customer.line_contact}</div>` : ''}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-gray-900">
                                ${customerAppointments.length}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-gray-900">
                                $${customerAppointments.reduce((sum, apt) => sum + apt.price, 0).toFixed(2)}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-gray-900">
                                ${lastVisit}
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

// Search customers
function searchCustomers() {
    const searchTerm = document.getElementById('customer-search').value.toLowerCase();
    const filteredCustomers = customers.filter(customer => 
        customer.name.toLowerCase().includes(searchTerm) ||
        customer.email.toLowerCase().includes(searchTerm) ||
        customer.phone.includes(searchTerm)
    );
    renderCustomersList(filteredCustomers);
}

// Render services list
function renderServicesList() {
    const servicesList = document.getElementById('services-list');
    
    servicesList.innerHTML = services.map(service => `
        <div class="bg-gray-50 rounded-lg p-6 border ${service.active ? '' : 'opacity-75 border-red-200'}">
            <div class="flex justify-between items-start mb-4">
                <h3 class="font-playfair text-lg font-bold text-gray-800 ${service.active ? '' : 'text-gray-500'}">${service.name}</h3>
                <span class="text-2xl font-bold ${service.active ? 'text-purple-600' : 'text-gray-400'}">$${service.price}</span>
            </div>
            <p class="text-gray-600 mb-4 ${service.active ? '' : 'text-gray-400'}">${service.description}</p>
            <div class="flex justify-between items-center text-sm text-gray-500 mb-4">
                <span><i class="fas fa-clock mr-1"></i> ${service.duration}min</span>
                <span class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">${service.category}</span>
            </div>
            <div class="flex justify-between items-center">
                <span class="text-sm ${service.active ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'} px-3 py-1 rounded-full">
                    <i class="fas fa-circle mr-1"></i>
                    ${service.active ? 'Active on Homepage' : 'Paused (Hidden)'}
                </span>
                <div class="space-x-2">
                    <button onclick="editService('${service.id}')" class="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50 transition" title="Edit Service">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="toggleService('${service.id}')" class="text-${service.active ? 'red' : 'green'}-600 hover:text-${service.active ? 'red' : 'green'}-800 p-2 rounded hover:bg-${service.active ? 'red' : 'green'}-50 transition" title="${service.active ? 'Pause Service' : 'Activate Service'}">
                        <i class="fas fa-${service.active ? 'pause' : 'play'}"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Render staff list
function renderStaffList() {
    const staffList = document.getElementById('staff-list');
    
    staffList.innerHTML = staff.map(member => `
        <div class="bg-gray-50 rounded-lg p-6 border ${member.active ? '' : 'opacity-75 border-red-200'}">
            <div class="text-center mb-4">
                <div class="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mx-auto mb-4 flex items-center justify-center ${member.active ? '' : 'grayscale opacity-75'}">
                    ${member.photo_url ? 
                        `<img src="${member.photo_url}" alt="${member.name}" class="w-full h-full object-cover rounded-full">` :
                        `<i class="fas fa-user text-white text-2xl"></i>`
                    }
                </div>
                <h3 class="font-playfair text-lg font-bold ${member.active ? 'text-gray-800' : 'text-gray-500'}">${member.name}</h3>
                <p class="${member.active ? 'text-purple-600' : 'text-gray-400'}">${member.specialties.join(', ')}</p>
            </div>
            <p class="text-gray-600 text-sm mb-4 ${member.active ? '' : 'text-gray-400'}">${member.bio}</p>
            <div class="space-y-2 text-sm text-gray-600 mb-4">
                <div><i class="fas fa-envelope mr-2"></i>${member.email}</div>
                <div><i class="fas fa-phone mr-2"></i>${member.phone}</div>
            </div>
            <div class="flex justify-between items-center">
                <span class="text-sm ${member.active ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'} px-3 py-1 rounded-full">
                    <i class="fas fa-circle mr-1"></i>
                    ${member.active ? 'Active on Homepage' : 'Paused (Hidden)'}
                </span>
                <div class="space-x-2">
                    <button onclick="editStaff('${member.id}')" class="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50 transition" title="Edit Staff Member">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="toggleStaff('${member.id}')" class="text-${member.active ? 'red' : 'green'}-600 hover:text-${member.active ? 'red' : 'green'}-800 p-2 rounded hover:bg-${member.active ? 'red' : 'green'}-50 transition" title="${member.active ? 'Pause Staff Member' : 'Activate Staff Member'}">
                        <i class="fas fa-${member.active ? 'pause' : 'play'}"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Load settings
function loadSettings() {
    if (businessSettings) {
        document.getElementById('salon-name').value = businessSettings.salon_name || '';
        document.getElementById('salon-phone').value = businessSettings.phone || '';
        document.getElementById('salon-address').value = businessSettings.address || '';
        document.getElementById('salon-email').value = businessSettings.email || '';
        document.getElementById('about-text').value = businessSettings.about_text || '';
    }
}

// Save settings
async function saveSettings(e) {
    e.preventDefault();
    showLoading(true);
    
    try {
        const formData = new FormData(e.target);
        const settings = Object.fromEntries(formData.entries());

        businessSettings = await SupabaseAPI.update('business_settings', businessSettings.id, settings);
        
        if (businessSettings) {
            alert('Settings saved successfully!');
        } else {
            throw new Error('Failed to save settings');
        }
    } catch (error) {
        console.error('Error saving settings:', error);
        alert('Error saving settings. Please try again.');
    } finally {
        showLoading(false);
    }
}

// Helper functions
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function showLoading(show) {
    const loading = document.getElementById('loading');
    if (show) {
        loading.classList.remove('hidden');
    } else {
        loading.classList.add('hidden');
    }
}

// Service Management Functions
async function editService(serviceId) {
    const service = services.find(s => s.id === serviceId);
    if (!service) {
        alert('Service not found!');
        return;
    }
    
    // Populate the modal with current service data
    document.getElementById('edit-service-id').value = service.id;
    document.getElementById('edit-service-name').value = service.name;
    document.getElementById('edit-service-category').value = service.category;
    document.getElementById('edit-service-duration').value = service.duration;
    document.getElementById('edit-service-price').value = service.price;
    document.getElementById('edit-service-image').value = service.image_url || '';
    document.getElementById('edit-service-description').value = service.description;
    document.getElementById('edit-service-active').checked = service.active;
    
    // Show the modal
    document.getElementById('service-edit-modal').classList.remove('hidden');
}

async function toggleService(serviceId) {
    const service = services.find(s => s.id === serviceId);
    if (!service) {
        alert('Service not found!');
        return;
    }
    
    const newStatus = !service.active;
    const action = newStatus ? 'activate' : 'pause';
    
    if (confirm(`Are you sure you want to ${action} "${service.name}"?`)) {
        showLoading(true);

        try {
            const updatedService = await SupabaseAPI.update('services', serviceId, { active: newStatus });

            if (updatedService) {
                // Update local data
                service.active = newStatus;

                // Refresh the services list
                renderServicesList();

                // Also refresh the overview statistics since service count might change
                if (currentTab === 'overview') {
                    calculateStatistics();
                }

                alert(`Service ${newStatus ? 'activated' : 'paused'} successfully!\n${newStatus ? 'It will now appear on the homepage.' : 'It has been hidden from the homepage.'}`);
            } else {
                throw new Error('Failed to update service');
            }
        } catch (error) {
            console.error('Error toggling service:', error);
            alert('Error updating service. Please try again.');
        } finally {
            showLoading(false);
        }
    }
}

function closeServiceModal() {
    document.getElementById('service-edit-modal').classList.add('hidden');
    document.getElementById('service-edit-form').reset();
}

// Handle service edit form submission
function setupServiceFormListener() {
    const serviceEditForm = document.getElementById('service-edit-form');
    if (serviceEditForm) {
        serviceEditForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const serviceId = document.getElementById('edit-service-id').value;
            const formData = new FormData(e.target);
            const serviceData = Object.fromEntries(formData.entries());
            
            // Convert checkbox to boolean
            serviceData.active = document.getElementById('edit-service-active').checked;
            // Convert duration and price to numbers
            serviceData.duration = parseInt(serviceData.duration);
            serviceData.price = parseFloat(serviceData.price);
            
            showLoading(true);

            try {
                const updatedService = await SupabaseAPI.update('services', serviceId, serviceData);

                if (updatedService) {
                    // Update local services array
                    const serviceIndex = services.findIndex(s => s.id === serviceId);
                    if (serviceIndex !== -1) {
                        services[serviceIndex] = updatedService;
                    }

                    // Refresh the services list
                    renderServicesList();

                    // Close modal
                    closeServiceModal();

                    alert('Service updated successfully!');
                } else {
                    throw new Error('Failed to update service');
                }
            } catch (error) {
                console.error('Error updating service:', error);
                alert('Error updating service. Please try again.');
            } finally {
                showLoading(false);
            }
        });
    }
}

// Appointment Management Functions
async function editAppointmentStatus(appointmentId) {
    const appointment = appointments.find(apt => apt.id === appointmentId);
    if (!appointment) {
        alert('Appointment not found!');
        return;
    }
    
    // Populate the appointment edit modal
    populateAppointmentModal(appointment);
    
    // Show the modal
    document.getElementById('appointment-edit-modal').classList.remove('hidden');
}

async function deleteAppointment(appointmentId) {
    const appointment = appointments.find(apt => apt.id === appointmentId);
    if (!appointment) {
        alert('Appointment not found!');
        return;
    }
    
    const customer = customers.find(c => c.id === appointment.customer_id);
    const service = services.find(s => s.id === appointment.service_id);
    
    if (confirm(`Are you sure you want to delete this appointment?\n\nCustomer: ${customer?.name || 'Unknown'}\nService: ${service?.name || 'Unknown'}\nDate: ${new Date(appointment.date).toLocaleDateString()}\nTime: ${appointment.time}\n\nThis action cannot be undone.`)) {
        showLoading(true);

        try {
            const deleted = await SupabaseAPI.delete('appointments', appointmentId);

            if (deleted) {
                // Remove from local array
                const appointmentIndex = appointments.findIndex(apt => apt.id === appointmentId);
                if (appointmentIndex !== -1) {
                    appointments.splice(appointmentIndex, 1);
                }

                // Refresh the appointments list
                renderAppointmentsList();

                // Also refresh the overview if we're on that tab
                if (currentTab === 'overview') {
                    calculateStatistics();
                    renderTodaySchedule();
                }

                alert('Appointment deleted successfully!');
            } else {
                throw new Error('Failed to delete appointment');
            }
        } catch (error) {
            console.error('Error deleting appointment:', error);
            alert('Error deleting appointment. Please try again.');
        } finally {
            showLoading(false);
        }
    }
}

function populateAppointmentModal(appointment) {
    // Find related data
    const customer = customers.find(c => c.id === appointment.customer_id);
    const service = services.find(s => s.id === appointment.service_id);
    const assignedStaff = staff.find(s => s.id === appointment.staff_id);
    
    // Populate hidden ID
    document.getElementById('edit-appointment-id').value = appointment.id;
    
    // Populate read-only display fields
    document.getElementById('edit-customer-name').textContent = customer?.name || 'Unknown Customer';
    document.getElementById('edit-service-name').textContent = service?.name || 'Unknown Service';
    document.getElementById('edit-service-duration').textContent = `${service?.duration || 0} minutes`;
    document.getElementById('edit-service-price').textContent = `$${appointment.price}`;
    
    // Populate editable fields
    document.getElementById('edit-appointment-date').value = new Date(appointment.date).toISOString().split('T')[0];
    document.getElementById('edit-appointment-time').value = appointment.time;
    document.getElementById('edit-appointment-status').value = appointment.status;
    document.getElementById('edit-appointment-notes').value = appointment.notes || '';
    
    // Set minimum date to today (but allow past appointments to be edited)
    const dateInput = document.getElementById('edit-appointment-date');
    const today = new Date().toISOString().split('T')[0];
    // Don't set min date - allow editing of past appointments for record keeping
    
    // Populate staff dropdown
    const staffSelect = document.getElementById('edit-appointment-staff');
    staffSelect.innerHTML = '<option value="unassigned">No Staff Assigned</option>';
    
    // Add active staff members
    const activeStaff = staff.filter(member => member.active);
    activeStaff.forEach(member => {
        const option = document.createElement('option');
        option.value = member.id;
        option.textContent = member.name;
        if (appointment.staff_id === member.id) {
            option.selected = true;
        }
        staffSelect.appendChild(option);
    });
    
    // If current staff is inactive, still show them as selected
    if (appointment.staff_id && !activeStaff.find(s => s.id === appointment.staff_id)) {
        if (assignedStaff) {
            const option = document.createElement('option');
            option.value = assignedStaff.id;
            option.textContent = `${assignedStaff.name} (Inactive)`;
            option.selected = true;
            staffSelect.appendChild(option);
        }
    }
}

function closeAppointmentModal() {
    document.getElementById('appointment-edit-modal').classList.add('hidden');
    document.getElementById('appointment-edit-form').reset();
}

// Staff Management Functions
async function editStaff(staffId) {
    const staffMember = staff.find(s => s.id === staffId);
    if (!staffMember) {
        alert('Staff member not found!');
        return;
    }
    
    // Populate the modal with current staff data
    document.getElementById('edit-staff-id').value = staffMember.id;
    document.getElementById('edit-staff-name').value = staffMember.name;
    document.getElementById('edit-staff-email').value = staffMember.email;
    document.getElementById('edit-staff-phone').value = staffMember.phone;
    document.getElementById('edit-staff-photo').value = staffMember.photo_url || '';
    document.getElementById('edit-staff-bio').value = staffMember.bio;
    document.getElementById('edit-staff-working-hours').value = staffMember.working_hours || '';
    document.getElementById('edit-staff-active').checked = staffMember.active;
    
    // Set specialties checkboxes
    const specialtyCheckboxes = document.querySelectorAll('input[name="specialties"]');
    specialtyCheckboxes.forEach(checkbox => {
        checkbox.checked = staffMember.specialties.includes(checkbox.value);
    });
    
    // Show the modal
    document.getElementById('staff-edit-modal').classList.remove('hidden');
}

async function toggleStaff(staffId) {
    const staffMember = staff.find(s => s.id === staffId);
    if (!staffMember) {
        alert('Staff member not found!');
        return;
    }
    
    const newStatus = !staffMember.active;
    const action = newStatus ? 'activate' : 'pause';
    
    if (confirm(`Are you sure you want to ${action} "${staffMember.name}"?`)) {
        showLoading(true);

        try {
            const updatedStaff = await SupabaseAPI.update('staff', staffId, { active: newStatus });

            if (updatedStaff) {
                // Update local data
                staffMember.active = newStatus;

                // Refresh the staff list
                renderStaffList();

                // Also refresh the overview statistics since staff count might change
                if (currentTab === 'overview') {
                    calculateStatistics();
                }

                alert(`Staff member ${newStatus ? 'activated' : 'paused'} successfully!\n${newStatus ? 'They will now appear on the homepage.' : 'They have been hidden from the homepage.'}`);
            } else {
                throw new Error('Failed to update staff member');
            }
        } catch (error) {
            console.error('Error toggling staff member:', error);
            alert('Error updating staff member. Please try again.');
        } finally {
            showLoading(false);
        }
    }
}

function closeStaffModal() {
    document.getElementById('staff-edit-modal').classList.add('hidden');
    document.getElementById('staff-edit-form').reset();
}

function showAddServiceModal() {
    console.log('Show add service modal');
}

function showAddStaffModal() {
    console.log('Show add staff modal');
}

// User Management Functions
function renderUsersList() {
    const usersList = document.getElementById('users-list');
    
    if (!users || users.length === 0) {
        usersList.innerHTML = '<p class="text-gray-500 text-center py-8">No users found</p>';
        return;
    }
    
    usersList.innerHTML = users.map(user => `
        <div class="border border-gray-200 rounded-lg p-6 ${!user.active ? 'opacity-75 bg-gray-50' : 'bg-white'}">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                        <i class="fas fa-user text-white text-lg"></i>
                    </div>
                    <div>
                        <h3 class="font-semibold text-lg text-gray-800">${user.name}</h3>
                        <p class="text-gray-600">${user.email}</p>
                        <div class="flex items-center space-x-4 mt-2">
                            <span class="text-sm ${user.active ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'} px-3 py-1 rounded-full">
                                <i class="fas fa-circle mr-1"></i>
                                ${user.active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <button onclick="toggleUserStatus('${user.id}')"
                            class="text-${user.active ? 'red' : 'green'}-600 hover:text-${user.active ? 'red' : 'green'}-800 p-2 rounded hover:bg-${user.active ? 'red' : 'green'}-50 transition" 
                            title="${user.active ? 'Deactivate User' : 'Activate User'}">
                        <i class="fas fa-${user.active ? 'user-slash' : 'user-check'}"></i>
                    </button>
                    <button onclick="deleteUser('${user.id}')" 
                            class="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50 transition" 
                            title="Delete User">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

async function toggleUserStatus(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) {
        alert('User not found!');
        return;
    }
    
    const newStatus = !user.active;
    const action = newStatus ? 'activate' : 'deactivate';
    
    if (confirm(`Are you sure you want to ${action} "${user.name}"?`)) {
        showLoading(true);
        
        try {
            const updatedUser = await SupabaseAPI.update('users', userId, { active: newStatus });
            
            if (updatedUser) {
                user.active = newStatus;
                renderUsersList();
                alert(`User ${newStatus ? 'activated' : 'deactivated'} successfully!`);
            } else {
                throw new Error('Failed to update user status');
            }
        } catch (error) {
            console.error('Error updating user status:', error);
            alert('Error updating user status. Please try again.');
        } finally {
            showLoading(false);
        }
    }
}

async function deleteUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) {
        alert('User not found!');
        return;
    }
    
    if (confirm(`Are you sure you want to delete "${user.name}"? This action cannot be undone.`)) {
        showLoading(true);
        
        try {
            const result = await SupabaseAPI.delete('users', userId);
            
            if (result) {
                users = users.filter(u => u.id !== userId);
                renderUsersList();
                alert('User deleted successfully!');
            } else {
                throw new Error('Failed to delete user');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Error deleting user. Please try again.');
        } finally {
            showLoading(false);
        }
    }
}

function showAddUserModal() {
    document.getElementById('user-add-modal').classList.remove('hidden');
}

function closeUserModal() {
    document.getElementById('user-add-modal').classList.add('hidden');
    document.getElementById('user-add-form').reset();
}

function setupUserFormListener() {
    const userAddForm = document.getElementById('user-add-form');
    if (userAddForm) {
        userAddForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const userData = {
                name: formData.get('name'),
                email: formData.get('email'),
                active: true,
                created_by: getCurrentUser()?.email || 'admin'
            };
            
            showLoading(true);
            
            try {
                // Check if email already exists
                const existingUser = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
                if (existingUser) {
                    alert('A user with this email already exists!');
                    return;
                }
                
                const newUser = await SupabaseAPI.create('users', userData);
                
                if (newUser) {
                    users.push(newUser);
                    renderUsersList();
                    closeUserModal();
                    alert('User added successfully!');
                } else {
                    throw new Error('Failed to add user');
                }
            } catch (error) {
                console.error('Error adding user:', error);
                alert('Error adding user. Please try again.');
            } finally {
                showLoading(false);
            }
        });
    }
}

// Handle appointment edit form submission
function setupAppointmentFormListener() {
    const appointmentEditForm = document.getElementById('appointment-edit-form');
    if (appointmentEditForm) {
        appointmentEditForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const appointmentId = document.getElementById('edit-appointment-id').value;
            const formData = new FormData(e.target);
            
            // Validate required fields
            const date = formData.get('date');
            const time = formData.get('time');
            const staffId = formData.get('staff_id');
            const status = formData.get('status');
            
            if (!date || !time || !status) {
                alert('Please fill in all required fields (Date, Time, Status).');
                return;
            }
            
            // Check for staff conflicts (if staff is assigned and not the current appointment)
            if (staffId !== 'unassigned') {
                const conflictingAppointment = appointments.find(apt => 
                    apt.id !== appointmentId && 
                    apt.staff_id === staffId && 
                    new Date(apt.date).toDateString() === new Date(date).toDateString() && 
                    apt.time === time &&
                    ['scheduled', 'confirmed', 'in_progress'].includes(apt.status)
                );
                
                if (conflictingAppointment) {
                    const staffMember = staff.find(s => s.id === staffId);
                    if (!confirm(`Warning: ${staffMember?.name || 'This staff member'} already has an appointment at ${time} on ${new Date(date).toLocaleDateString()}.\n\nDo you want to continue anyway? This may cause scheduling conflicts.`)) {
                        return;
                    }
                }
            }
            
            // Get the original appointment to preserve customer, service, and price data
            const originalAppointment = appointments.find(apt => apt.id === appointmentId);

            const appointmentData = {
                customer_id: originalAppointment.customer_id,
                service_id: originalAppointment.service_id,
                date: date,
                time: time,
                duration: originalAppointment.duration,
                staff_id: staffId === 'unassigned' ? null : staffId,
                status: status,
                notes: formData.get('notes') || '',
                price: originalAppointment.price
            };

            showLoading(true);

            try {
                const updatedAppointment = await SupabaseAPI.update('appointments', appointmentId, appointmentData);

                if (updatedAppointment) {
                    // Update local appointments array
                    const appointmentIndex = appointments.findIndex(apt => apt.id === appointmentId);
                    if (appointmentIndex !== -1) {
                        appointments[appointmentIndex] = updatedAppointment;
                    }

                    // Refresh the appointments list
                    renderAppointmentsList();

                    // Also refresh the overview if we're on that tab
                    if (currentTab === 'overview') {
                        calculateStatistics();
                        renderTodaySchedule();
                    }

                    // Close modal
                    closeAppointmentModal();

                    const customer = customers.find(c => c.id === updatedAppointment.customer_id);
                    const staffMember = staff.find(s => s.id === updatedAppointment.staff_id);
                    const staffName = staffMember?.name || (!updatedAppointment.staff_id ? 'No staff assigned' : 'Unknown staff');
                    
                    alert(`Appointment updated successfully! ✅\n\nCustomer: ${customer?.name || 'Unknown'}\nDate: ${new Date(updatedAppointment.date).toLocaleDateString()}\nTime: ${updatedAppointment.time}\nStaff: ${staffName}\nStatus: ${capitalizeFirst(updatedAppointment.status.replace('_', ' '))}`);
                } else {
                    throw new Error('Failed to update appointment');
                }
            } catch (error) {
                console.error('Error updating appointment:', error);
                alert('Error updating appointment. Please try again.');
            } finally {
                showLoading(false);
            }
        });
    }
}

// Promotional Subscribers Management Functions
function renderPromotionalSubscribers() {
    const promotionalUsers = users.filter(user => user.promotional_consent === true);
    
    // Update statistics
    updatePromotionalStats(promotionalUsers);
    
    // Render subscriber list
    const subscribersList = document.getElementById('promotional-subscribers-list');
    
    if (promotionalUsers.length === 0) {
        subscribersList.innerHTML = '<p class="text-gray-500 text-center py-8">No promotional subscribers found</p>';
        return;
    }
    
    subscribersList.innerHTML = promotionalUsers.map(user => `
        <div class="border border-gray-200 rounded-lg p-6 bg-white hover:shadow-md transition">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                        <i class="fas fa-envelope text-white text-lg"></i>
                    </div>
                    <div>
                        <h3 class="font-semibold text-lg text-gray-800">${user.name}</h3>
                        <p class="text-gray-600">${user.email}</p>
                        <div class="flex items-center space-x-4 mt-2">
                            <span class="text-sm ${getSourceColor(user.promotional_source)} px-3 py-1 rounded-full">
                                <i class="fas fa-${getSourceIcon(user.promotional_source)} mr-1"></i>
                                ${capitalizeFirst(user.promotional_source || 'manual')} signup
                            </span>
                            <span class="text-sm text-gray-500">
                                Subscribed: ${new Date(user.promotional_signup_date).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <button onclick="unsubscribeUser('${user.id}')" 
                            class="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50 transition" 
                            title="Unsubscribe User">
                        <i class="fas fa-user-minus"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function updatePromotionalStats(promotionalUsers) {
    const totalSubscribers = promotionalUsers.length;
    const bookingSignups = promotionalUsers.filter(u => u.promotional_source === 'booking').length;
    const homepageSignups = promotionalUsers.filter(u => u.promotional_source === 'homepage').length;
    
    document.getElementById('total-subscribers').textContent = totalSubscribers;
    document.getElementById('booking-subscribers').textContent = bookingSignups;
    document.getElementById('homepage-subscribers').textContent = homepageSignups;
}

function getSourceColor(source) {
    const colors = {
        'booking': 'text-green-600 bg-green-100',
        'homepage': 'text-blue-600 bg-blue-100',
        'manual': 'text-purple-600 bg-purple-100'
    };
    return colors[source] || colors['manual'];
}

function getSourceIcon(source) {
    const icons = {
        'booking': 'calendar-check',
        'homepage': 'mouse-pointer',
        'manual': 'user-plus'
    };
    return icons[source] || icons['manual'];
}

async function unsubscribeUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) {
        alert('User not found!');
        return;
    }
    
    if (confirm(`Are you sure you want to unsubscribe "${user.name}" from promotional emails?`)) {
        showLoading(true);
        
        try {
            const updatedUser = await SupabaseAPI.update('users', userId, { 
                promotional_consent: false,
                promotional_signup_date: null,
                promotional_source: null
            });
            
            if (updatedUser) {
                user.promotional_consent = false;
                user.promotional_signup_date = null;
                user.promotional_source = null;
                renderPromotionalSubscribers();
                alert('User unsubscribed successfully!');
            } else {
                throw new Error('Failed to unsubscribe user');
            }
        } catch (error) {
            console.error('Error unsubscribing user:', error);
            alert('Error unsubscribing user. Please try again.');
        } finally {
            showLoading(false);
        }
    }
}

function exportPromotionalEmails() {
    const promotionalUsers = users.filter(user => user.promotional_consent === true);
    
    if (promotionalUsers.length === 0) {
        alert('No promotional subscribers to export!');
        return;
    }
    
    // Create CSV content
    const csvContent = [
        'Name,Email,Signup Source,Signup Date',
        ...promotionalUsers.map(user => 
            `"${user.name}","${user.email}","${user.promotional_source || 'manual'}","${new Date(user.promotional_signup_date).toLocaleDateString()}"`
        )
    ].join('\n');
    
    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `promotional_subscribers_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert(`Exported ${promotionalUsers.length} promotional subscribers to CSV file!`);
}

function openGmailCompose() {
    const promotionalUsers = users.filter(user => user.promotional_consent === true);
    
    if (promotionalUsers.length === 0) {
        alert('No promotional subscribers found!');
        return;
    }
    
    // Create email list for BCC
    const emailList = promotionalUsers.map(user => user.email).join(',');
    
    // Gmail compose URL with BCC field pre-filled
    const subject = encodeURIComponent('Exclusive Beauty Offer from Tina Beauty Studio');
    const body = encodeURIComponent(`Dear Beauty Lover,

We have an exciting special offer just for you!

[Add your promotional message here]

Best regards,
Tina Beauty Studio Team

---
You're receiving this because you subscribed to our promotional emails.
To unsubscribe, please contact us at admin@tinabeautystudio.com`);
    
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&bcc=${encodeURIComponent(emailList)}&su=${subject}&body=${body}`;
    
    // Open Gmail in new tab
    window.open(gmailUrl, '_blank');
    
    alert(`Opening Gmail with ${promotionalUsers.length} subscribers in BCC field!`);
}
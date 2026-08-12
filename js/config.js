// Supabase Configuration
// Replace these two values with your own project's after running supabase-schema.sql
// (Supabase dashboard -> Project Settings -> API)
const Config = {
    // Supabase connection details
    SUPABASE_URL: 'https://lmqasluawbympifvjuoo.supabase.co',
    SUPABASE_API_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtcWFzbHVhd2J5bXBpZnZqdW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1NDE4NTMsImV4cCI6MjEwMjExNzg1M30.cq4XHnS34qo0F6KurmNv2Ze-AYAODAXf4sghVXD55wU',

    // Get Supabase REST API base URL
    getApiBaseUrl() {
        return `${this.SUPABASE_URL}/rest/v1`;
    },

    // Helper function to get full API URL for table operations
    getApiUrl(tableName) {
        return `${this.getApiBaseUrl()}/${tableName}`;
    },

    // Get headers for Supabase API requests. The apikey header is always the
    // public anon key (required by Supabase's gateway), but the Authorization
    // bearer token uses the logged-in admin's session JWT when one exists, so
    // RLS policies that check auth.role() = 'authenticated' apply correctly.
    // Falls back to the anon key for anonymous (public-site) requests.
    async getHeaders(method = 'GET') {
        let accessToken = this.SUPABASE_API_KEY;

        if (window.supabaseClient) {
            const { data } = await window.supabaseClient.auth.getSession();
            if (data.session) {
                accessToken = data.session.access_token;
            }
        }

        const headers = {
            'apikey': this.SUPABASE_API_KEY,
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        };

        // Add Prefer header so POST/PATCH return the affected record instead of 204 No Content
        if (method === 'POST' || method === 'PATCH') {
            headers['Prefer'] = 'return=representation';
        }

        return headers;
    },

    // Debug function to log current configuration
    debug() {
        console.log('Supabase Config Debug:', {
            hostname: window.location.hostname,
            origin: window.location.origin,
            supabaseUrl: this.SUPABASE_URL,
            apiBaseUrl: this.getApiBaseUrl(),
            testApiUrl: this.getApiUrl('services')
        });
    }
};

// Helper functions for Supabase operations
const SupabaseAPI = {
    // Get all records from a table
    async getAll(tableName, options = {}) {
        let url = Config.getApiUrl(tableName);

        // Add query parameters if provided
        const params = new URLSearchParams();
        if (options.select) params.append('select', options.select);
        if (options.order) params.append('order', options.order);
        if (options.limit) params.append('limit', options.limit);
        if (options.offset) params.append('offset', options.offset);

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: await Config.getHeaders()
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch ${tableName}: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    },

    // Get a single record by ID
    async getById(tableName, id) {
        const response = await fetch(`${Config.getApiUrl(tableName)}?id=eq.${id}`, {
            method: 'GET',
            headers: await Config.getHeaders()
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch ${tableName} with id ${id}: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data[0] || null;
    },

    // Create a new record
    async create(tableName, data) {
        const response = await fetch(Config.getApiUrl(tableName), {
            method: 'POST',
            headers: await Config.getHeaders('POST'),
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`Failed to create ${tableName}: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        return result[0] || result;
    },

    // Update a record by ID
    async update(tableName, id, data) {
        const response = await fetch(`${Config.getApiUrl(tableName)}?id=eq.${id}`, {
            method: 'PATCH',
            headers: await Config.getHeaders('PATCH'),
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`Failed to update ${tableName} with id ${id}: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        return result[0] || result;
    },

    // Delete a record by ID
    async delete(tableName, id) {
        const response = await fetch(`${Config.getApiUrl(tableName)}?id=eq.${id}`, {
            method: 'DELETE',
            headers: await Config.getHeaders()
        });

        if (!response.ok) {
            throw new Error(`Failed to delete ${tableName} with id ${id}: ${response.status} ${response.statusText}`);
        }

        return response.ok;
    },

    // Query with filters
    async query(tableName, filters = {}, options = {}) {
        let url = Config.getApiUrl(tableName);
        const params = new URLSearchParams();

        // Add filters
        Object.entries(filters).forEach(([key, value]) => {
            if (typeof value === 'object' && value !== null && value.operator) {
                params.append(key, `${value.operator}.${value.value}`);
            } else if (typeof value === 'string' || typeof value === 'boolean' || typeof value === 'number') {
                params.append(key, `eq.${value}`);
            }
        });

        // Add options
        if (options.select) params.append('select', options.select);
        if (options.order) params.append('order', options.order);
        if (options.limit) params.append('limit', options.limit);

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: await Config.getHeaders()
        });

        if (!response.ok) {
            throw new Error(`Failed to query ${tableName}: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    },

    // Call a Postgres RPC function (used for public actions that need to bypass
    // RLS narrowly on the server side, e.g. promotional signup - see js/booking.js)
    async rpc(fnName, params = {}) {
        const response = await fetch(`${Config.getApiBaseUrl()}/rpc/${fnName}`, {
            method: 'POST',
            headers: await Config.getHeaders('POST'),
            body: JSON.stringify(params)
        });

        if (!response.ok) {
            throw new Error(`RPC ${fnName} failed: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    }
};

// Make Config and SupabaseAPI available globally
window.Config = Config;
window.SupabaseAPI = SupabaseAPI;

// Supabase Auth client (used only for admin login - see js/auth.js)
window.supabaseClient = window.supabase.createClient(Config.SUPABASE_URL, Config.SUPABASE_API_KEY);

// Test function to check Supabase API connectivity
window.testApi = async function() {
    console.log('Testing Supabase API connectivity...');
    Config.debug();

    try {
        const response = await fetch(Config.getApiUrl('services'), {
            method: 'GET',
            headers: await Config.getHeaders()
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', [...response.headers.entries()]);

        if (response.ok) {
            const data = await response.json();
            console.log('Success! Data received:', data);
            console.log('Number of services found:', data.length);
            return true;
        } else {
            console.error('API request failed:', response.status, response.statusText);
            const text = await response.text();
            console.error('Response body:', text);

            // Check if it's a table not found error
            if (response.status === 404) {
                console.error('❌ TABLES NOT FOUND: Please run the SQL scripts in Supabase!');
                console.error('📋 Instructions: See SUPABASE_SETUP_INSTRUCTIONS.md');
            }
            return false;
        }
    } catch (error) {
        console.error('Network error:', error);
        return false;
    }
};

// Quick function to test all tables
window.testAllTables = async function() {
    const tables = ['services', 'staff', 'customers', 'appointments', 'business_settings'];

    console.log('🔍 Testing all database tables (as the current session)...');

    for (const table of tables) {
        try {
            const data = await SupabaseAPI.getAll(table);
            console.log(`✅ ${table}: ${data.length} records found`);
        } catch (error) {
            console.error(`❌ ${table}: Error - ${error.message}`);
        }
    }

    // users has no public policies by design - only reachable while logged in as admin
    try {
        const data = await SupabaseAPI.getAll('users');
        console.log(`✅ users: ${data.length} records found (admin session)`);
    } catch (error) {
        console.log('ℹ️ users: not readable (expected unless logged in as admin)');
    }
};

// Function to sanity-check the database setup
window.checkDatabaseSetup = async function() {
    console.log('🔍 Checking database setup...');

    const tables = ['services', 'staff', 'business_settings'];
    const results = {};

    for (const table of tables) {
        try {
            const data = await SupabaseAPI.getAll(table, { limit: 1 });
            results[table] = { exists: true, records: data.length };
            console.log(`✅ ${table}: reachable`);
        } catch (error) {
            results[table] = { exists: false, error: error.message };
            console.log(`❌ ${table}: ${error.message}`);
        }
    }

    const allTablesExist = tables.every(table => results[table].exists);

    if (allTablesExist) {
        console.log('✅ Database setup appears correct!');
        console.log('👤 To test admin login, create a user in Supabase Authentication -> Users.');
        return true;
    } else {
        console.error('❌ Some tables missing. Please run supabase-schema.sql.');
        return false;
    }
};

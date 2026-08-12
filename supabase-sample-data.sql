-- Sample Data for Tina Beauty Studio
-- Run this AFTER creating the schema tables

-- Insert Business Settings
INSERT INTO business_settings (setting_key, salon_name, address, phone, whatsapp, email, opening_hours, about_text, services_intro) VALUES
('main', 
 'Tina Beauty Studio Patong',
 '123 Thaweewong Road, Patong Beach, Kathu, Phuket 83150, Thailand',
 '+66 76 123 456',
 '+66 0849719575',
 'hello@tinabeautystudio.com',
 '{"monday": "9:00 AM - 8:00 PM", "tuesday": "9:00 AM - 8:00 PM", "wednesday": "9:00 AM - 8:00 PM", "thursday": "9:00 AM - 8:00 PM", "friday": "9:00 AM - 9:00 PM", "saturday": "9:00 AM - 9:00 PM", "sunday": "10:00 AM - 7:00 PM"}',
 'Welcome to Tina Beauty Studio Patong, where luxury meets wellness in the heart of Phuket''s most vibrant beach destination. Our expert team is dedicated to providing you with an exceptional beauty experience using premium products and the latest techniques.',
 'Discover our comprehensive range of luxury beauty services, each designed to enhance your natural beauty and provide a moment of pure indulgence.'
);

-- Insert Services
INSERT INTO services (name, description, duration, price, category, image_url, active) VALUES
('Luxury Facial Treatment', 'Rejuvenate your skin with our signature luxury facial featuring premium skincare products, deep cleansing, exfoliation, and a relaxing face massage. Perfect for all skin types.', 90, 2500.00, 'Skincare', 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', true),

('Professional Makeup Application', 'Get camera-ready with our professional makeup service. Perfect for special events, photoshoots, or when you want to look your absolute best. Includes consultation and touch-up kit.', 60, 1800.00, 'Makeup', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', true),

('Gel Manicure & Pedicure', 'Pamper your hands and feet with our signature gel manicure and pedicure service. Long-lasting, chip-resistant finish with a wide selection of colors and nail art options.', 120, 1200.00, 'Nails', 'https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', true),

('Hair Styling & Treatment', 'Transform your look with our expert hair styling and nourishing treatment service. Includes wash, conditioning treatment, cut, and professional styling.', 150, 3200.00, 'Hair', 'https://images.unsplash.com/photo-1562322140-8baeececf3df?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', true),

('Relaxing Spa Massage', 'Unwind with our therapeutic full-body massage using premium essential oils. Choose from Swedish, Thai, or aromatherapy techniques for the ultimate relaxation experience.', 90, 2800.00, 'Spa', 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', true),

('Eyebrow Shaping & Tinting', 'Perfect your brows with our professional shaping and tinting service. Includes consultation, precise shaping, and semi-permanent tinting for beautifully defined eyebrows.', 45, 800.00, 'Other', 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', true);

-- Insert Staff
INSERT INTO staff (name, email, phone, specialties, bio, photo_url, working_hours, active) VALUES
('Tina Nakamura', 'tina@tinabeautystudio.com', '+66 0849719575', ARRAY['Skincare', 'Facial Treatments', 'Anti-aging'], 'Master aesthetician with over 10 years of experience in luxury skincare. Specialized in advanced facial treatments and anti-aging therapies. Passionate about helping clients achieve their best skin.', 'https://images.unsplash.com/photo-1594824311799-82b5c5cb7681?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', '{"monday": "9:00-17:00", "tuesday": "9:00-17:00", "wednesday": "9:00-17:00", "thursday": "9:00-17:00", "friday": "9:00-17:00", "saturday": "10:00-18:00", "sunday": "off"}', true),

('Sarah Johnson', 'sarah@tinabeautystudio.com', '+66 92 345 6789', ARRAY['Makeup', 'Special Events', 'Bridal'], 'Professional makeup artist with expertise in bridal, editorial, and special event makeup. Certified in multiple makeup techniques and passionate about enhancing natural beauty for every occasion.', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', '{"monday": "10:00-18:00", "tuesday": "10:00-18:00", "wednesday": "off", "thursday": "10:00-18:00", "friday": "10:00-20:00", "saturday": "9:00-19:00", "sunday": "10:00-16:00"}', true),

('Mali Siriwan', 'mali@tinabeautystudio.com', '+66 93 456 7890', ARRAY['Nails', 'Nail Art', 'Spa Treatments'], 'Expert nail technician and spa therapist with a flair for creative nail art. Specialized in gel applications, nail health, and relaxing spa treatments. Brings artistic vision to every service.', 'https://images.unsplash.com/photo-1559599101-f09722fb4948?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', '{"monday": "9:00-17:00", "tuesday": "9:00-17:00", "wednesday": "9:00-17:00", "thursday": "off", "friday": "9:00-17:00", "saturday": "9:00-18:00", "sunday": "10:00-16:00"}', true);

-- Insert Sample Customers
INSERT INTO customers (name, email, phone, whatsapp, line_contact, address, notes, total_visits, total_spent) VALUES
('Emma Wilson', 'emma.wilson@email.com', '+66 94 567 8901', '+66 94 567 8901', 'emma_line123', 'Patong Beach, Phuket', 'Prefers morning appointments, sensitive skin', 8, 15600.00),
('Lisa Chen', 'lisa.chen@email.com', '+66 95 678 9012', '+66 95 678 9012', '', 'Kata Beach, Phuket', 'Regular customer, loves nail art', 12, 22400.00),
('Jessica Brown', 'jessica.brown@email.com', '+66 96 789 0123', '+66 96 789 0123', '+66 96 789 0123', 'Karon Beach, Phuket', 'Special event makeup preferred', 5, 9800.00);

-- Insert Sample Appointments
INSERT INTO appointments (customer_id, staff_id, service_id, date, time, duration, status, notes, price) VALUES
(
    (SELECT id FROM customers WHERE email = 'emma.wilson@email.com'),
    (SELECT id FROM staff WHERE email = 'tina@tinabeautystudio.com'),
    (SELECT id FROM services WHERE name = 'Luxury Facial Treatment'),
    CURRENT_DATE + INTERVAL '2 days',
    '10:00:00',
    90,
    'confirmed',
    'First-time luxury facial, discussed skincare routine',
    2500.00
),
(
    (SELECT id FROM customers WHERE email = 'lisa.chen@email.com'),
    (SELECT id FROM staff WHERE email = 'mali@tinabeautystudio.com'),
    (SELECT id FROM services WHERE name = 'Gel Manicure & Pedicure'),
    CURRENT_DATE + INTERVAL '1 day',
    '14:00:00',
    120,
    'scheduled',
    'Requested floral nail art design',
    1200.00
),
(
    (SELECT id FROM customers WHERE email = 'jessica.brown@email.com'),
    (SELECT id FROM staff WHERE email = 'sarah@tinabeautystudio.com'),
    (SELECT id FROM services WHERE name = 'Professional Makeup Application'),
    CURRENT_DATE,
    '16:00:00',
    60,
    'completed',
    'Wedding makeup trial, very happy with results',
    1800.00
),
(
    (SELECT id FROM customers WHERE email = 'emma.wilson@email.com'),
    (SELECT id FROM staff WHERE email = 'mali@tinabeautystudio.com'),
    (SELECT id FROM services WHERE name = 'Relaxing Spa Massage'),
    CURRENT_DATE + INTERVAL '3 days',
    '11:00:00',
    90,
    'scheduled',
    'Requested aromatherapy massage',
    2800.00
),
(
    (SELECT id FROM customers WHERE email = 'lisa.chen@email.com'),
    (SELECT id FROM staff WHERE email = 'tina@tinabeautystudio.com'),
    (SELECT id FROM services WHERE name = 'Eyebrow Shaping & Tinting'),
    CURRENT_DATE + INTERVAL '5 days',
    '13:30:00',
    45,
    'scheduled',
    'Regular eyebrow maintenance',
    800.00
);

-- Admin accounts are NOT created here. After running this file, go to the
-- Supabase dashboard -> Authentication -> Users -> Add user, and create your
-- admin login there (email + password). That account can then sign in at
-- login.html - see supabase-schema.sql for how access is enforced.
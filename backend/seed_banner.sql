-- Insert a test banner
INSERT INTO banners (id, title, description, image_url, link_url, sort_order, is_active, created_at, updated_at)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'RUVÉRA COUTURE',
    'Spring / Summer 2025',
    'https://images.unsplash.com/photo-1490481651871-ab56bbb10a99?q=80&w=2070&auto=format&fit=crop',
    '/shop',
    1,
    true,
    NOW(),
    NOW()
) ON DUPLICATE KEY UPDATE 
    title = VALUES(title), 
    description = VALUES(description), 
    image_url = VALUES(image_url), 
    is_active = true;

USE couture_db;

INSERT INTO sizes (id, name, code, size_group, sort_order) VALUES
(UUID(), 'Small', 'S', 'clothing', 1),
(UUID(), 'Medium', 'M', 'clothing', 2),
(UUID(), 'Large', 'L', 'clothing', 3),
(UUID(), 'Extra Large', 'XL', 'clothing', 4),
(UUID(), 'XX Large', 'XXL', 'clothing', 5);

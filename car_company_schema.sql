-- INVENTORY TABLE (Equipment for Car Company)
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name TEXT NOT NULL,
  category TEXT NOT NULL, -- e.g., 'Engine', 'Interior', 'Electronics'
  current_stock INT NOT NULL DEFAULT 0,
  min_threshold INT NOT NULL DEFAULT 5, -- Reorder level
  unit_price DECIMAL(10,2),
  status TEXT CHECK (status IN ('In Stock', 'Low Stock', 'Out of Stock')) GENERATED ALWAYS AS (
    CASE 
      WHEN current_stock = 0 THEN 'Out of Stock'
      WHEN current_stock < min_threshold THEN 'Low Stock'
      ELSE 'In Stock'
    END
  ) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- VENDORS TABLE
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  specialization TEXT NOT NULL, -- e.g., 'High-Performance Engines'
  rating FLOAT DEFAULT 4.5,
  reliability_score FLOAT DEFAULT 0.9, -- 0 to 1
  average_lead_time_days INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SEED DATA FOR CAR COMPANY
INSERT INTO inventory (item_name, category, current_stock, min_threshold, unit_price) VALUES
('V8 Engine Block', 'Engine', 3, 5, 4500.00),
('Alloy Wheels (18")', 'Wheels', 20, 10, 200.00),
('Brake Pads Set', 'Safety', 4, 15, 80.00),
('LED Headlight Unit', 'Electronics', 50, 20, 350.00),
('Leather Seat Cover', 'Interior', 2, 10, 150.00);

INSERT INTO vendors (name, specialization, rating, reliability_score, average_lead_time_days) VALUES
('Precision Machining Co.', 'Engine', 4.8, 0.95, 14),
('Global Auto Parts', 'General', 4.2, 0.85, 5),
('Elite Interiors', 'Interior', 4.5, 0.90, 7),
('SafeStop Braking', 'Safety', 4.7, 0.98, 3);

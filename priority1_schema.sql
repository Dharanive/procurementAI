-- ============================================
-- PRIORITY 1: CORE ENHANCEMENTS - DATABASE SCHEMA
-- ============================================

-- 1. PREDICTIVE INVENTORY - Consumption History Tracking
CREATE TABLE IF NOT EXISTS inventory_consumption_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE,
  quantity_consumed INT NOT NULL,
  consumption_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_consumption_inventory_date ON inventory_consumption_history(inventory_id, consumption_date DESC);

-- 2. BUDGET & COST OPTIMIZATION
CREATE TABLE IF NOT EXISTS procurement_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  monthly_limit DECIMAL(10,2) NOT NULL,
  current_spend DECIMAL(10,2) DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES procurement_tasks(id) ON DELETE SET NULL,
  vendor_id UUID REFERENCES vendors(id),
  inventory_id UUID REFERENCES inventory(id),
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_cost DECIMAL(10,2) NOT NULL,
  status TEXT CHECK (status IN ('Draft', 'Pending Approval', 'Approved', 'Ordered', 'Delivered', 'Cancelled')) DEFAULT 'Draft',
  order_date DATE DEFAULT CURRENT_DATE,
  expected_delivery_date DATE,
  actual_delivery_date DATE,
  items JSONB, -- For multiple items in one PO
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_po_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_po_vendor ON purchase_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_po_task ON purchase_orders(task_id);

-- 3. APPROVAL WORKFLOW
CREATE TABLE IF NOT EXISTS approval_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID REFERENCES purchase_orders(id) ON DELETE CASCADE,
  task_id UUID REFERENCES procurement_tasks(id) ON DELETE CASCADE,
  request_type TEXT CHECK (request_type IN ('Purchase Order', 'Budget Override', 'Vendor Selection', 'High Value Purchase')) NOT NULL,
  amount DECIMAL(10,2),
  requester_id UUID, -- References users(id) - can be NULL for system requests
  current_approver_level INT DEFAULT 1,
  max_approval_level INT DEFAULT 3,
  status TEXT CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Escalated', 'Cancelled')) DEFAULT 'Pending',
  approval_chain JSONB, -- [{level: 1, approver: 'Manager', status: 'Pending'}, ...]
  comments TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID -- References users(id)
);

CREATE INDEX IF NOT EXISTS idx_approval_status ON approval_requests(status);
CREATE INDEX IF NOT EXISTS idx_approval_po ON approval_requests(purchase_order_id);

CREATE TABLE IF NOT EXISTS approval_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  approval_request_id UUID REFERENCES approval_requests(id) ON DELETE CASCADE,
  approver_id UUID, -- References users(id)
  approver_name TEXT,
  approval_level INT,
  action TEXT CHECK (action IN ('Approved', 'Rejected', 'Escalated')) NOT NULL,
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. REAL-TIME NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID, -- NULL for system-wide notifications
  type TEXT CHECK (type IN ('Inventory Alert', 'Task Assignment', 'Approval Request', 'Approval Status', 'Budget Alert', 'Vendor Update', 'System')) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT, -- URL to relevant page/item
  read BOOLEAN DEFAULT FALSE,
  priority TEXT CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')) DEFAULT 'Medium',
  metadata JSONB, -- Additional data for the notification
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Function to update budget spend automatically
CREATE OR REPLACE FUNCTION update_budget_spend()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'Approved' AND OLD.status != 'Approved' THEN
    UPDATE procurement_budgets
    SET current_spend = current_spend + NEW.total_cost,
        updated_at = NOW()
    WHERE category = (
      SELECT category FROM inventory WHERE id = NEW.inventory_id
    )
    AND CURRENT_DATE BETWEEN period_start AND period_end;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_budget_spend
AFTER UPDATE ON purchase_orders
FOR EACH ROW
EXECUTE FUNCTION update_budget_spend();

-- Seed some initial data
INSERT INTO procurement_budgets (category, monthly_limit, period_start, period_end) VALUES
('Engine', 50000.00, DATE_TRUNC('month', CURRENT_DATE), (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day')),
('Wheels', 20000.00, DATE_TRUNC('month', CURRENT_DATE), (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day')),
('Safety', 15000.00, DATE_TRUNC('month', CURRENT_DATE), (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day')),
('Electronics', 30000.00, DATE_TRUNC('month', CURRENT_DATE), (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day')),
('Interior', 10000.00, DATE_TRUNC('month', CURRENT_DATE), (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day'))
ON CONFLICT DO NOTHING;

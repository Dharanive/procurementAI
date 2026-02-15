-- SEED DATA FOR DEMO

-- Insert Demo Employees
INSERT INTO users (name, role, skills, max_capacity, allocated_hours) VALUES
('Alice Johnson', 'Senior Procurement Specialist', '["Procurement", "Negotiation", "Vendor Management"]', 40, 15),
('Bob Smith', 'Procurement Manager', '["Procurement", "Contract Management", "Supply Chain"]', 40, 30),
('Carol Davis', 'Junior Buyer', '["Procurement", "Vendor Management"]', 40, 10),
('David Lee', 'Supply Chain Analyst', '["Supply Chain", "Negotiation"]', 40, 25),
('Emma Wilson', 'Contract Specialist', '["Contract Management", "Negotiation"]', 40, 20);

-- Insert Demo Tasks
INSERT INTO procurement_tasks (title, required_skill, estimated_hours, priority, status) VALUES
('Purchase office furniture', 'Procurement', 8, 'Medium', 'Pending'),
('Negotiate vendor contracts', 'Negotiation', 12, 'High', 'Pending'),
('Review supply chain logistics', 'Supply Chain', 6, 'Low', 'Pending');

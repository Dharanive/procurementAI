-- USERS TABLE (Employees)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  skills JSONB NOT NULL DEFAULT '[]',
  max_capacity INT NOT NULL, -- in hours/week
  allocated_hours INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PROCUREMENT TASKS TABLE
CREATE TABLE procurement_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  required_skill TEXT NOT NULL,
  estimated_hours INT NOT NULL,
  priority TEXT CHECK (priority IN ('Low', 'Medium', 'High')) DEFAULT 'Medium',
  status TEXT CHECK (status IN ('Pending', 'In Progress', 'Completed')) DEFAULT 'Pending',
  assigned_to UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ASSIGNMENT LOGS TABLE (Explainability)
CREATE TABLE assignment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES procurement_tasks(id),
  employee_id UUID REFERENCES users(id),
  score FLOAT NOT NULL,
  reasoning TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

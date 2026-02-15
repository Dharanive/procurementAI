# ProcureAI - Multi-Agent Smart Procurement System

A DEMO enterprise procurement system powered by AI that automatically assigns tasks to employees based on skill matching and bandwidth availability using LangGraph multi-agent orchestration.

## 🚀 Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **AI/Agents**: LangGraph, OpenAI
- **Package Manager**: pnpm

## 📋 Features

- ✅ **AI-Powered Task Assignment**: Multi-agent system using LangGraph
- ✅ **Skill-Based Matching**: Assigns tasks based on employee skills
- ✅ **Bandwidth Optimization**: Considers employee workload and capacity
- ✅ **Explainable AI**: Full transparency with assignment reasoning
- ✅ **Real-time Dashboard**: Employee utilization and task overview
- ✅ **Clean Architecture**: Scalable folder structure

## 🏗️ Architecture

```
src/
 ├─ app/
 │   ├─ dashboard/          # Dashboard page
 │   ├─ procurement/        # Task creation page
 │   ├─ employees/          # Employee management
 │   └─ api/assign/         # Assignment API endpoint
 ├─ agents/
 │   ├─ orchestrator.ts     # LangGraph workflow
 │   ├─ workforceAgent.ts   # Fetches employees
 │   └─ assignmentAgent.ts  # Assignment logic
 ├─ services/
 │   └─ scoringEngine.ts    # Scoring algorithm
 ├─ lib/
 │   ├─ supabase.ts         # Supabase client
 │   └─ openai.ts           # OpenAI client
 └─ types/
     └─ index.ts            # TypeScript types
```

## 📊 Database Schema

### `users` (Employees)
- `id` (UUID)
- `name` (TEXT)
- `role` (TEXT)
- `skills` (JSONB) - Array of skills
- `max_capacity` (INT) - Hours per week
- `allocated_hours` (INT) - Currently allocated

### `procurement_tasks`
- `id` (UUID)
- `title` (TEXT)
- `required_skill` (TEXT)
- `estimated_hours` (INT)
- `priority` (TEXT) - Low/Medium/High
- `status` (TEXT) - Pending/In Progress/Completed
- `assigned_to` (UUID) - Foreign key to users

### `assignment_logs`
- `id` (UUID)
- `task_id` (UUID)
- `employee_id` (UUID)
- `score` (FLOAT)
- `reasoning` (TEXT)
- `created_at` (TIMESTAMP)

## 🧮 Scoring Algorithm

```
score = (skillMatch × 0.4) + (availabilityRatio × 0.6)

where:
  skillMatch = 1 if employee has required skill, else 0
  availabilityRatio = (max_capacity - allocated_hours) / max_capacity
```

## 🛠️ Setup Instructions

### 1. Clone and Install

```bash
cd smart-procurement
pnpm install
```

### 2. Setup Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the schema from `schema.sql` in the SQL Editor
3. Run the seed data from `seed.sql` to populate demo employees

### 3. Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🎯 Usage Flow

1. **Navigate to Procurement Page** (`/procurement`)
2. **Create a Task**:
   - Enter task title
   - Select required skill
   - Set estimated hours
   - Choose priority
3. **Click "Create Task"**
4. **Click "Auto Assign"**
5. **View Assignment Result**:
   - Assigned employee
   - Assignment score
   - Detailed reasoning
   - Execution logs

## 🤖 Multi-Agent Flow

```
User Request → API Endpoint → LangGraph Orchestrator
                                      ↓
                              Workforce Agent
                              (Fetch Employees)
                                      ↓
                              Assignment Agent
                              (Calculate Scores)
                                      ↓
                              Update Database
                                      ↓
                              Return Result
```

## 📁 Key Files

- `src/agents/orchestrator.ts` - LangGraph workflow definition
- `src/agents/assignmentAgent.ts` - Core assignment logic
- `src/services/scoringEngine.ts` - Scoring algorithm
- `src/app/api/assign/route.ts` - API endpoint
- `schema.sql` - Database schema
- `seed.sql` - Demo data

## 🎨 Pages

- `/` - Landing page
- `/dashboard` - Employee and task overview
- `/procurement` - Create and assign tasks
- `/employees` - Employee workload management

## 🔧 Customization

### Add New Skills

Edit the select options in `src/app/procurement/page.tsx`:

```tsx
<SelectItem value="YourSkill">Your Skill</SelectItem>
```

### Adjust Scoring Weights

Modify `src/services/scoringEngine.ts`:

```typescript
const score = (skillMatch * 0.4) + (availabilityRatio * 0.6);
// Change weights as needed
```

## 🚨 Important Notes

- This is a **DEMO** project - not production-ready
- No authentication implemented
- No real-time subscriptions
- Simplified error handling
- Basic validation only

## 📝 Future Enhancements

- [ ] User authentication
- [ ] Real-time updates with Supabase subscriptions
- [ ] Advanced filtering and search
- [ ] Task reassignment
- [ ] Historical analytics
- [ ] Email notifications
- [ ] Multi-skill matching
- [ ] Team-based assignments

## 📄 License

MIT

## 🤝 Contributing

This is a demo project. Feel free to fork and customize for your needs.

---

Built with ❤️ using Next.js, LangGraph, and Supabase

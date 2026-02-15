# ✅ Quick Start Checklist

## Setup (One-time)

### 1. Supabase Setup
- [ ] Create Supabase project at https://supabase.com
- [ ] Run `schema.sql` in SQL Editor
- [ ] Run `seed.sql` in SQL Editor
- [ ] Copy Project URL from Settings → API
- [ ] Copy anon key from Settings → API

### 2. OpenAI Setup
- [ ] Get API key from https://platform.openai.com/api-keys

### 3. Environment Variables
- [ ] Create `.env.local` file in project root
- [ ] Add `NEXT_PUBLIC_SUPABASE_URL=...`
- [ ] Add `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
- [ ] Add `OPENAI_API_KEY=...`

### 4. Start Development
- [ ] Run `pnpm dev`
- [ ] Open http://localhost:3000

## Testing

### Verify Dashboard
- [ ] Go to `/dashboard`
- [ ] See 5 employees
- [ ] See 3 tasks
- [ ] Utilization bars showing

### Test Assignment
- [ ] Go to `/procurement`
- [ ] Create task:
  - Title: "Test Task"
  - Skill: "Procurement"
  - Hours: 10
  - Priority: High
- [ ] Click "Create Task"
- [ ] Click "Auto Assign"
- [ ] See assignment result with:
  - Employee name
  - Score
  - Reasoning
  - Logs

### Verify Database
- [ ] Check Supabase Table Editor
- [ ] `procurement_tasks` has new task
- [ ] Task has `assigned_to` value
- [ ] Employee's `allocated_hours` increased
- [ ] `assignment_logs` has new entry

## Common Commands

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## File Locations

- **Database Schema**: `schema.sql`
- **Seed Data**: `seed.sql`
- **Environment Template**: `.env.example`
- **Setup Guide**: `SETUP_GUIDE.md`
- **Main README**: `README.md`

## Support

If you encounter issues:
1. Check `SETUP_GUIDE.md` troubleshooting section
2. Verify all environment variables are set
3. Check browser console for errors
4. Check terminal for server errors
5. Verify Supabase tables have data

## Success Indicators

✅ No errors in terminal
✅ No errors in browser console
✅ Dashboard shows employee data
✅ Auto-assign creates assignment
✅ Database updates correctly

---

**Ready? Start with Step 1: Supabase Setup!**

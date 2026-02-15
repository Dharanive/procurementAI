import { supabase } from '@/lib/supabase';
import { User, ProcurementTask } from '../types';
import { ChatOpenAI } from "@langchain/openai";

export interface AssignmentResult {
    best_employee_id: string;
    best_employee_name: string;
    reasoning: string;
    score: number;
}

/**
 * FULLY AGENTIC Assignment Agent
 * Uses OpenAI LLM to intelligently analyze and assign tasks to employees
 */
export async function assignTask(
    taskId: string,
    employees: User[]
): Promise<AssignmentResult | null> {
    // 1. Fetch Task Details
    const { data: task, error: taskError } = await supabase
        .from('procurement_tasks')
        .select('*')
        .eq('id', taskId)
        .single();

    if (taskError || !task) {
        throw new Error(`Task not found: ${taskError?.message}`);
    }

    const pTask = task as ProcurementTask;

    // 2. Initialize OpenAI LLM
    const llm = new ChatOpenAI({
        modelName: "gpt-4o-mini", // Fast and cost-effective
        temperature: 0.3, // Some creativity but mostly deterministic
        openAIApiKey: process.env.OPENAI_API_KEY,
    });

    // 3. Build context for LLM
    const employeeContext = employees.map((emp, idx) => {
        const utilization = emp.max_capacity > 0
            ? Math.round((emp.allocated_hours / emp.max_capacity) * 100)
            : 100;
        const available = emp.max_capacity - emp.allocated_hours;

        return `
Employee ${idx + 1}:
- ID: ${emp.id}
- Name: ${emp.name}
- Role: ${emp.role}
- Skills: ${emp.skills.join(', ')}
- Capacity: ${emp.max_capacity} hours/week
- Currently Allocated: ${emp.allocated_hours} hours
- Available Hours: ${available} hours
- Utilization: ${utilization}%
        `.trim();
    }).join('\n\n');

    const prompt = `You are an AI procurement task assignment specialist. Analyze the following task and employees, then recommend the BEST employee for this assignment.

TASK DETAILS:
- Title: ${pTask.title}
- Required Skill: ${pTask.required_skill}
- Estimated Hours: ${pTask.estimated_hours}
- Priority: ${pTask.priority}

AVAILABLE EMPLOYEES:
${employeeContext}

ASSIGNMENT CRITERIA:
1. Skill Match (40% weight): Does the employee have the required skill "${pTask.required_skill}"?
2. Availability (60% weight): Does the employee have enough capacity? Consider their current workload.
3. Priority Consideration: For high-priority tasks, prefer employees with lower utilization.

INSTRUCTIONS:
Analyze each employee and provide your recommendation in the following JSON format:
{
  "recommended_employee_name": "Full name of the best employee",
  "score": 0.85,
  "reasoning": "Detailed explanation of why this employee is the best choice, considering skill match, availability, and workload balance."
}

Respond ONLY with valid JSON, no additional text.`;

    console.log("[AI Agent] Sending prompt to OpenAI...");

    // 4. Get AI recommendation
    const response = await llm.invoke(prompt);
    const aiResponse = response.content.toString();

    console.log("[AI Agent] Received response:", aiResponse);

    // 5. Parse AI response
    let aiDecision: {
        recommended_employee_name: string;
        score: number;
        reasoning: string;
    };

    try {
        // Extract JSON from response (in case there's extra text)
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("No JSON found in AI response");
        }
        aiDecision = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
        console.error("[AI Agent] Failed to parse AI response:", parseError);
        throw new Error("AI returned invalid response format");
    }

    // 6. Find the recommended employee
    const bestEmployee = employees.find(
        emp => emp.name.toLowerCase() === aiDecision.recommended_employee_name.toLowerCase()
    );

    if (!bestEmployee || !bestEmployee.id) {
        console.error("[AI Agent] Could not find recommended employee:", aiDecision.recommended_employee_name);
        return null;
    }

    console.log(`[AI Agent] AI selected: ${bestEmployee.name} with score ${aiDecision.score}`);

    // 7. Update Task Assignment
    const { error: updateError } = await supabase
        .from('procurement_tasks')
        .update({
            assigned_to: bestEmployee.id,
            status: 'In Progress'
        })
        .eq('id', taskId);

    if (updateError) throw new Error(updateError.message);

    // 8. Update Employee Allocated Hours
    const newAllocation = bestEmployee.allocated_hours + pTask.estimated_hours;
    const { error: allocError } = await supabase
        .from('users')
        .update({ allocated_hours: newAllocation })
        .eq('id', bestEmployee.id);

    if (allocError) console.error("[AI Agent] Failed to update hours", allocError);

    // 9. Create Assignment Log
    const { error: logError } = await supabase
        .from('assignment_logs')
        .insert({
            task_id: taskId,
            employee_id: bestEmployee.id,
            score: aiDecision.score,
            reasoning: `[AI-POWERED ASSIGNMENT]\n\n${aiDecision.reasoning}`
        });

    if (logError) console.error("[AI Agent] Failed to log assignment", logError);

    // 10. Return result
    return {
        best_employee_id: bestEmployee.id,
        best_employee_name: bestEmployee.name,
        reasoning: `🤖 AI-Powered Assignment\n\n${aiDecision.reasoning}`,
        score: aiDecision.score
    };
}

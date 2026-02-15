import { User, ProcurementTask } from '../types';

export const calculateScore = (employee: User, task: ProcurementTask): number => {
    // Skill Match (40%)
    const skillMatch = employee.skills.includes(task.required_skill) ? 1 : 0;

    // Availability (60%)
    const availabilityRatio =
        employee.max_capacity > 0
            ? Math.max(0, (employee.max_capacity - employee.allocated_hours) / employee.max_capacity)
            : 0;

    const score = (skillMatch * 0.4) + (availabilityRatio * 0.6);
    return parseFloat(score.toFixed(2));
};

export const generateReasoning = (
    employee: User,
    task: ProcurementTask,
    score: number,
    skillMatch: boolean,
    availabilityRatio: number
): string => {
    return `Assignment Score: ${score.toFixed(2)}. 
  - Skill Match: ${skillMatch ? 'YES' : 'NO'} (${task.required_skill}). 
  - Availability: ${(availabilityRatio * 100).toFixed(0)}% available 
    (${employee.allocated_hours}/${employee.max_capacity} hours allocated).`;
};

import { Goal, GoalFilters } from "@/app/server/goals/types";
import { queryGoals, getGoalById } from "@/app/server/goals/internals/goalReader";
import { createGoal, CreateGoalParams } from "@/app/server/goals/internals/goalWriter";

export async function getGoals(filters?: GoalFilters): Promise<Goal[]> {
  return queryGoals(filters);
}

export async function getGoalByIdService(goalId: string): Promise<Goal> {
  return getGoalById(goalId);
}

export async function createGoalService(params: CreateGoalParams): Promise<{
  goal: Goal | null;
  error: string | null;
}> {
  return createGoal(params);
}

export type { CreateGoalParams };
export { GoalType } from "@/app/server/goals/types";

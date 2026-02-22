"use server";

import { v4 as uuidv4 } from "uuid";
import prisma from "@/lib/prisma";
import { Goal, GoalType } from "@/app/server/goals/types";

export interface CreateGoalParams {
  userId: string;
  name: string;
  goalType: GoalType;
  targetValue: number;
  startDate: Date;
  endDate: Date;
}

export async function createGoal(params: CreateGoalParams): Promise<{
  goal: Goal | null;
  error: string | null;
}> {
  try {
    // Validation
    if (params.endDate <= params.startDate) {
      return { goal: null, error: "End date must be after start date" };
    }
    if (params.targetValue <= 0) {
      return { goal: null, error: "Target value must be greater than 0" };
    }
    if (!params.name.trim()) {
      return { goal: null, error: "Goal name cannot be empty" };
    }

    // Idempotency check
    const existingGoal = await prisma.goal.findFirst({
      where: {
        user_id: params.userId,
        name: params.name,
        goal_type: params.goalType,
        start_date: params.startDate,
        end_date: params.endDate,
        target_value: params.targetValue,
      },
    });

    if (existingGoal) {
      return { goal: new Goal(existingGoal), error: null };
    }

    // Create goal
    const result = await prisma.goal.create({
      data: {
        sid: uuidv4(),
        user_id: params.userId,
        name: params.name,
        goal_type: params.goalType,
        target_value: params.targetValue,
        start_date: params.startDate,
        end_date: params.endDate,
      },
    });

    return { goal: new Goal(result), error: null };
  } catch (error) {
    console.error("Unexpected error creating goal:", error);
    return {
      goal: null,
      error: "An unexpected error occurred while creating goal",
    };
  }
}

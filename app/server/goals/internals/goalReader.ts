"use server";

import { Goal, GoalFilters } from "@/app/server/goals/types";
import prisma from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma-client/client";

export async function queryGoals(filters?: GoalFilters): Promise<Goal[]> {
  try {
    const whereClause = buildFilters(filters);

    const data = await prisma.goal.findMany({
      where: whereClause,
      orderBy: { datetime_created: "desc" },
    });

    return data.map((row) => new Goal(row));
  } catch (error) {
    console.error("Unexpected error querying goals:", error);
    throw new Error("An unexpected error occurred while querying goals");
  }
}

export async function getGoalById(goalId: string): Promise<Goal> {
  const data = await prisma.goal.findFirstOrThrow({
    where: { sid: goalId },
  });

  return new Goal(data);
}

function buildFilters(incomingFilters?: GoalFilters): Prisma.GoalWhereInput {
  const whereClause: Prisma.GoalWhereInput = {};

  if (!incomingFilters) return whereClause;

  if (incomingFilters.userId) {
    whereClause.user_id = { equals: incomingFilters.userId };
  }

  if (incomingFilters.isActive !== undefined) {
    const now = new Date();
    if (incomingFilters.isActive) {
      whereClause.start_date = { lte: now };
      whereClause.end_date = { gte: now };
    }
  }

  return whereClause;
}

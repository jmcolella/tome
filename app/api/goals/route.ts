import { headers } from "next/headers";
import { getGoals, createGoalService } from "@/app/server/goals/goalsService";
import { GoalApiEntity, AddGoalApiInput, GoalApiFilters } from "@/app/api/goals/types";
import { GoalFilters, GoalType } from "@/app/server/goals/types";
import { parseDateLocal } from "@/app/server/utils/dateUtils";

export async function GET(request: Request) {
  const headersList = await headers();
  const userId = headersList.get("x-user-id");

  if (!userId) {
    return new Response(
      JSON.stringify({ error: "User not authenticated", data: null }),
      { status: 401 }
    );
  }

  try {
    const url = new URL(request.url);
    const filtersParam = url.searchParams.get("filters");

    const filters: GoalFilters = { userId };

    if (filtersParam) {
      const parsed = JSON.parse(filtersParam) as GoalApiFilters;
      if (parsed.is_active !== undefined) {
        filters.isActive = parsed.is_active;
      }
    }

    const goals = await getGoals(filters);
    const goalApiEntities = goals.map((goal) => new GoalApiEntity(goal));

    return new Response(
      JSON.stringify({ data: goalApiEntities, error: null }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing GET /api/goals:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred", data: null }),
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const headersList = await headers();
  const userId = headersList.get("x-user-id");

  if (!userId) {
    return new Response(
      JSON.stringify({ error: "User not authenticated", data: null }),
      { status: 401 }
    );
  }

  try {
    const body: AddGoalApiInput = await request.json();

    // Validate required fields
    if (
      !body.name ||
      !body.goalType ||
      !body.targetValue ||
      !body.startDate ||
      !body.endDate
    ) {
      return new Response(
        JSON.stringify({ error: "All fields are required", data: null }),
        { status: 400 }
      );
    }

    // Validate enum
    if (!Object.values(GoalType).includes(body.goalType)) {
      return new Response(
        JSON.stringify({ error: "Invalid goalType", data: null }),
        { status: 400 }
      );
    }

    // Parse dates as local dates (not UTC)
    let startDate: Date;
    let endDate: Date;
    try {
      startDate = parseDateLocal(body.startDate);
      endDate = parseDateLocal(body.endDate);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error("Invalid date");
      }
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid date format", data: null }),
        { status: 400 }
      );
    }

    const { goal, error } = await createGoalService({
      userId,
      name: body.name,
      goalType: body.goalType,
      targetValue: body.targetValue,
      startDate,
      endDate,
    });

    if (error || !goal) {
      return new Response(
        JSON.stringify({
          error: error || "Failed to create goal",
          data: null,
        }),
        { status: 400 }
      );
    }

    const goalApiEntity = new GoalApiEntity(goal);

    return new Response(JSON.stringify({ data: goalApiEntity, error: null }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error processing POST /api/goals:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process request",
        data: null,
      }),
      { status: 500 }
    );
  }
}

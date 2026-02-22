import { useQuery } from "@tanstack/react-query";
import { GoalApiEntity, GoalApiFilters } from "@/app/api/goals/types";
import { ApiResponse } from "@/app/api/types";

interface UseGetGoalsOptions {
  filters?: GoalApiFilters;
}

function useGetGoals(options?: UseGetGoalsOptions) {
  const { filters } = options || {};

  const query = useQuery<ApiResponse<GoalApiEntity[]>>({
    queryKey: ["goals", filters],
    queryFn: async () => {
      const url = new URL("/api/goals", window.location.origin);

      if (filters) {
        url.searchParams.set("filters", JSON.stringify(filters));
      }

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error("Failed to fetch goals");

      return response.json();
    },
  });

  return {
    goals: query.data?.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}

export default useGetGoals;

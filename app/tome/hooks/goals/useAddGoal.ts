import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GoalApiEntity, AddGoalApiInput } from "@/app/api/goals/types";
import { ApiResponse } from "@/app/api/types";

function useAddGoal() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<GoalApiEntity>, Error, AddGoalApiInput>({
    mutationFn: async (goalData: AddGoalApiInput) => {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(goalData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add goal");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
}

export default useAddGoal;

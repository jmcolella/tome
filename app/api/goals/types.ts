import { Goal, GoalType } from "@/app/server/goals/types";

export interface AddGoalApiInput {
  name: string;
  goalType: GoalType;
  targetValue: number;
  startDate: string; // ISO 8601 (YYYY-MM-DD)
  endDate: string;
}

export interface GoalApiFilters {
  is_active?: boolean;
}

export class GoalApiEntity {
  public readonly sid: string;
  public readonly creationOrderId: number;
  public readonly datetimeCreated: Date;
  public readonly datetimeUpdated: Date;
  public readonly userId: string;
  public readonly name: string;
  public readonly goalType: GoalType;
  public readonly targetValue: number;
  public readonly startDate: Date;
  public readonly endDate: Date;

  constructor(goal: Goal) {
    this.sid = goal.sid;
    this.creationOrderId = goal.creationOrderId;
    this.datetimeCreated = goal.datetimeCreated;
    this.datetimeUpdated = goal.datetimeUpdated;
    this.userId = goal.userId;
    this.name = goal.name;
    this.goalType = goal.goalType;
    this.targetValue = goal.targetValue;
    this.startDate = goal.startDate;
    this.endDate = goal.endDate;
  }
}

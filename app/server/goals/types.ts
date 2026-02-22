import type { GoalModel } from "@/lib/generated/prisma-client/models/Goal";
import convertStringToEnum from "@/app/server/utils/convertStringToEnum";

export enum GoalType {
  PAGES = "PAGES",
  BOOKS = "BOOKS",
}

export interface GoalFilters {
  userId?: string;
  isActive?: boolean;
}

export class Goal {
  public readonly sid: GoalModel["sid"];
  public readonly creationOrderId: GoalModel["creation_order_id"];
  public readonly datetimeCreated: GoalModel["datetime_created"];
  public readonly datetimeUpdated: GoalModel["datetime_updated"];
  public readonly userId: GoalModel["user_id"];
  public readonly name: GoalModel["name"];
  public readonly goalType: GoalType;
  public readonly targetValue: GoalModel["target_value"];
  public readonly startDate: GoalModel["start_date"];
  public readonly endDate: GoalModel["end_date"];

  constructor(data: GoalModel) {
    this.sid = data.sid;
    this.creationOrderId = data.creation_order_id;
    this.datetimeCreated = data.datetime_created;
    this.datetimeUpdated = data.datetime_updated;
    this.userId = data.user_id;
    this.name = data.name;
    this.goalType = convertStringToEnum<GoalType>(
      data.goal_type,
      Object.values(GoalType)
    );
    this.targetValue = data.target_value;
    this.startDate = data.start_date;
    this.endDate = data.end_date;
  }
}

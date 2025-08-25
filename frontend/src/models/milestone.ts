import type { UserStory } from "./user_story";

export interface Milestone {
    id: number;
    name: string;
    slug: string;
    estimated_start: string;
    estimated_finish: string;
    closed_points: number;
    total_points: number;
    user_stories: UserStory[];
    count_swimlanes: MilestoneCountData[];
    count_tags: MilestoneCountData[];
    count_statuses: MilestoneCountData[];
    // ref: number;
    // project_id: number;
    // subject: string;
    // status: number;
    // status_extra_info: string;
    // swimlane: number;
    // points: { [key: string]: number };
    // is_closed: boolean;
    // assigned_users: number[];
}

export interface MilestoneCountData {
    name: string;
    user_story: number;
    total_points: number;
}
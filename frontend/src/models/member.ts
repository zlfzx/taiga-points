import type { UserStory } from "./user_story";

export interface Member {
    id: number;
    user_id: number;
    project_id: number;
    role: number;
    role_name: string;
    full_name: string;
    full_name_display: string;
    photo: string;
    is_user_active: boolean;
    stories: UserStory[];
    todo_stories: number;
    in_progress_stories: number;
    remaining_point: number;
    completed_point: number
    total_point: number;
    created_at: string;
}
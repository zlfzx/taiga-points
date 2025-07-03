

export interface UserStory {
    id: number;
    ref: number;
    project_id: number;
    subject: string;
    status: number;
    swimlane: number;
    points: { [key: string]: number };
    is_closed: boolean;
    assigned_users: number[];
}
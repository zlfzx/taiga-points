

export interface UserStory {
    id: number;
    ref: number;
    project_id: number;
    subject: string;
    status: number;
    status_extra_info: StatusExtraInfo;
    tags: string[][];
    swimlane: number;
    points: { [key: string]: number };
    point?: number;
    total_points?: number;
    is_closed: boolean;
    assigned_users: number[];
    milestone: number;
    milestone_name: string;
    milestone_slug: string;
    url: string;
}

export interface StatusExtraInfo {
    name: string;
    color: string;
    is_closed: boolean;
}
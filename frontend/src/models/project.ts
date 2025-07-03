export interface Project {
    id: number;
    name: string;
    slug: string;
    description: string;
    logo_small_url: string;
    logo_big_url: string;
    roles: Role[];
    points: Point[];
    us_statuses: UserStoryStatus[];
    swimlanes: Swimlane[];
    // members: Member[];
}

export interface Role {
    id: number;
    name: string;
    slug: string;
    project_id: number;
    order: number;
    computable: boolean;
}

export interface Point {
    id: number;
    project_id: number;
    name: string;
    value: number;
}

export interface UserStoryStatus {
    id: number;
    project_id: number;
    name: string;
    color: string;
    slug: string;
    order: number;
    is_closed: boolean;
    is_archived: boolean;
}

export interface Swimlane {
    id: number;
    project_id: number;
    name: string;
    order: number;
}
export type Role = "admin" | "member";
export type Status = "normal" | "banned" | "forzen";

export interface User {
    id: number,
    natayark_id: number,
    username: string,
    email: string,
    avatar: string,
    role: Role,
    created_at: string,
    updated_at: string,
    status: Status
}
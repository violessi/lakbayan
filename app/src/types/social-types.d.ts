declare global {
  export interface CommentData {
    id: string;
    user_id: string;
    content: string;
    created_at: string;
    is_gps_verified: boolean;
  }
}

export {};

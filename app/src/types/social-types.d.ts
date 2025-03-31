declare global {
  export interface CommentData {
    id: string;
    userId: string;
    username: string;
    content: string;
    createdAt: string;
    isGpsVerified: boolean;
  }
}

export {};

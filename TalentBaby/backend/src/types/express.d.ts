declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role?: string;
        is_premium?: boolean;
      };
      userId?: number;
    }
  }
}

export {};

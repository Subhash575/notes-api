// src/types/index.ts
declare global {
  namespace Express {
    interface Request {
      user: {
        userId: number;
        email: string;
      };
    }
  }
}

export {}; // makes this a module, required for global declaration to work

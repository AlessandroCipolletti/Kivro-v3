import type { User } from "@kivro/database";

export type AppEnv = {
  Variables: {
    user: User;
  };
};

import type { User } from "@kivro/database";
import type { VerifiedBuyerApiKey } from "@kivro/buyer-api";

export type AppEnv = {
  Variables: {
    user: User;
    buyerApiKey?: VerifiedBuyerApiKey;
  };
};

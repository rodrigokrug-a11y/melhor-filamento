import { type DefaultSession } from "next-auth";

import { type AppRole } from "@/lib/permissions";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isAdmin: boolean;
      role: AppRole;
    } & DefaultSession["user"];
  }
}

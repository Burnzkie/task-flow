import path from "node:path";
import { defineConfig } from "prisma/config";
import * as dotenv from "dotenv";

// Manually load .env before anything else
dotenv.config({ path: path.join(process.cwd(), ".env") });

const DATABASE_URL = process.env.DATABASE_URL!;

export default defineConfig({
  earlyAccess: true,
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: DATABASE_URL,
  },
  migrate: {
    async adapter() {
      const { PrismaNeon } = await import("@prisma/adapter-neon");
      return new PrismaNeon({ connectionString: DATABASE_URL });
    },
  },
});
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url:
      process.env.DATABASE_URL ??
      "mysql://mwlabs_app:mwlabs_dev_password@127.0.0.1:3306/mwlabs_command",
    shadowDatabaseUrl:
      process.env.SHADOW_DATABASE_URL ??
      "mysql://mwlabs_app:mwlabs_dev_password@127.0.0.1:3306/mwlabs_shadow",
  },
});

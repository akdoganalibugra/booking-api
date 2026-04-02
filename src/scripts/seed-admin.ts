import bcrypt from "bcrypt";
import { UserRole } from "@prisma/client";
import { config } from "dotenv";

import { prisma } from "../config/prisma.js";

config();

const PASSWORD_SALT_ROUNDS = 10;
const DEFAULT_ADMIN_EMAIL = "admin@example.com";
const DEFAULT_ADMIN_PASSWORD = "password123";

function readArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const matched = process.argv.find((value) => value.startsWith(prefix));
  return matched?.slice(prefix.length);
}

async function main() {
  const email = readArg("email") ?? process.env.ADMIN_EMAIL ?? DEFAULT_ADMIN_EMAIL;
  const password = readArg("password") ?? process.env.ADMIN_PASSWORD ?? DEFAULT_ADMIN_PASSWORD;
  const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);

  await prisma.user.upsert({
    where: {
      email,
    },
    update: {
      role: UserRole.ADMIN,
      passwordHash,
    },
    create: {
      email,
      passwordHash,
      role: UserRole.ADMIN,
    },
  });

  console.log(
    JSON.stringify({
      message: "Admin kullanıcısı hazır.",
      email,
      role: UserRole.ADMIN,
    }),
  );
}

main()
  .catch((error) => {
    console.error("Admin bootstrap başarısız oldu.", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

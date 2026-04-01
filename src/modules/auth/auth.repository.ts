import type { Prisma, User } from "@prisma/client";

import { prisma } from "../../config/prisma.js";

export async function findUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
}

export async function createUser(data: Prisma.UserCreateInput): Promise<User> {
  return prisma.user.create({
    data,
  });
}


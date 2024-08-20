import { PrismaClient } from "@prisma/client";
// import { nodeEnv } from "../secret.js";

export const db = new PrismaClient();

// if(nodeEnv !== "production") globalThis.prisma = db
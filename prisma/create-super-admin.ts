
import "dotenv/config";
import passwordPrompt from "@inquirer/password";
import { hash } from "argon2";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL no está configurada.");
  }

  const rl = createInterface({
    input: stdin,
    output: stdout,
  });

  let name: string;
  let email: string;
  let password: string;

  try {
    name = (await rl.question("Nombre: ")).trim();
    email = (await rl.question("Correo: ")).trim().toLowerCase();
    password = await passwordPrompt({
  message: "Contraseña del SUPER_ADMIN:",
  mask: "*",
});
  } finally {
    rl.close();
  }

  if (!name || !email.includes("@") || password.length < 12) {
    throw new Error(
      "Debes indicar nombre, correo válido y contraseña de al menos 12 caracteres.",
    );
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString,
    }),
  });

  try {
    const existing = await prisma.adminUser.findUnique({
      where: { email },
    });

    if (existing) {
      throw new Error("Ya existe un administrador con ese correo.");
    }

    const admin = await prisma.adminUser.create({
      data: {
        name,
        email,
        passwordHash: await hash(password),
        role: "SUPER_ADMIN",
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    console.log("Administrador creado:", admin);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

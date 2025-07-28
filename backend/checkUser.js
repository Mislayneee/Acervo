const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { id: 1 },
  });

  if (user) {
    console.log("✅ Usuário encontrado:", user);
  } else {
    console.log("❌ Usuário com id = 1 não existe.");
  }

  await prisma.$disconnect();
}

main();

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const user1 = await prisma.user.create({
    data: {
      name: "Sarah Johnson",
      phone: "+971 50 123 4567",
      email: "sarah@example.com",
      telegramId: "12345678",
      origin: "Dubai",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: "Ahmed Al-Farsi",
      phone: "+971 55 987 6543",
      email: "ahmed@example.com",
      telegramId: "87654321",
      origin: "Abu Dhabi",
    },
  });

  const pet1 = await prisma.pet.create({
    data: {
      ownerId: user1.id,
      type: "cat",
      breed: "Persian",
      age: "3 years",
      weight: "4.5",
      microchip: "982000123456789",
      name: "Whiskers",
    },
  });

  const pet2 = await prisma.pet.create({
    data: {
      ownerId: user2.id,
      type: "cat",
      breed: "Siamese",
      age: "2 years",
      weight: "3.8",
      microchip: "982000987654321",
      name: "Nala",
    },
  });

  await prisma.relocation.create({
    data: {
      petId: pet1.id,
      origin: "Dubai",
      destination: "Spain",
      status: "documents_pending",
      flexDates: true,
    },
  });

  await prisma.relocation.create({
    data: {
      petId: pet2.id,
      origin: "Abu Dhabi",
      destination: "Portugal",
      status: "submitted",
      travelDate: new Date("2026-05-15"),
      flexDates: false,
    },
  });

  await prisma.document.create({
    data: {
      petId: pet1.id,
      fileUrl: "tg://file/sample-vaccination",
      fileId: "sample-file-id-1",
      type: "vaccination_card",
    },
  });

  await prisma.document.create({
    data: {
      petId: pet1.id,
      fileUrl: "tg://file/sample-rabies",
      fileId: "sample-file-id-2",
      type: "rabies_certificate",
    },
  });

  const volunteer = await prisma.volunteer.create({
    data: {
      name: "Maria Garcia",
      telegramId: "vol-12345",
      email: "maria@example.com",
    },
  });

  await prisma.flight.create({
    data: {
      route: "Dubai → Lisbon",
      date: new Date("2026-05-20"),
      airline: "Emirates",
      volunteerId: volunteer.id,
    },
  });

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

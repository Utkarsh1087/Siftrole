const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function emptyDatabase() {
  console.log("Emptying database as requested by user...");

  const delListings = await prisma.listing.deleteMany({});
  console.log(`- Deleted ${delListings.count} listings`);

  const delCompanies = await prisma.company.deleteMany({});
  console.log(`- Deleted ${delCompanies.count} companies`);

  const delLogs = await prisma.extractionLog.deleteMany({});
  console.log(`- Deleted ${delLogs.count} extraction logs`);

  const delEvents = await prisma.analyticsEvent.deleteMany({});
  console.log(`- Deleted ${delEvents.count} analytics events`);

  const delChats = await prisma.chatMessage.deleteMany({});
  console.log(`- Deleted ${delChats.count} chat messages`);

  const delSessions = await prisma.chatSession.deleteMany({});
  console.log(`- Deleted ${delSessions.count} chat sessions`);

  console.log("=== DATABASE IS NOW 100% EMPTY ===");
}

emptyDatabase()
  .catch((e) => {
    console.error("Error emptying database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

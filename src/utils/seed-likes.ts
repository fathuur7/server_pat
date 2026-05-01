import { prisma } from "./prisma";

async function main() {
  console.log("Randomizing likes and views...");

  const videos = await prisma.video.findMany();

  for (const video of videos) {
    const randomLikes = Math.floor(Math.random() * 5000) + 100;
    const randomViews = randomLikes + Math.floor(Math.random() * 20000);

    await prisma.video.update({
      where: { id: video.id },
      data: {
        likes: randomLikes,
        views: randomViews
      }
    });
  }

  console.log("Likes and views randomized! 🚀");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

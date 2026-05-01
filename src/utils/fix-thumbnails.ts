import { prisma } from "./prisma";

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log("Fetching real anime thumbnails...");

  const videos = await prisma.video.findMany();

  for (const video of videos) {
    try {
      console.log(`Searching for: ${video.title}`);
      // Jikan API rate limit is 3 requests per second, we'll wait 500ms between requests
      await sleep(500); 
      
      const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(video.title)}&limit=1`);
      const resData = (await res.json()) as any;
      const animeData = resData?.data?.[0];

      if (animeData && animeData.images?.jpg?.large_image_url) {
        const imageUrl = animeData.images.jpg.large_image_url;
        
        await prisma.video.update({
          where: { id: video.id },
          data: { thumbnailUrl: imageUrl }
        });
        console.log(`✅ Updated ${video.title}: ${imageUrl}`);
      } else {
        console.log(`❌ No image found for ${video.title}`);
      }
    } catch (err: any) {
      console.error(`Error fetching for ${video.title}: ${err.message}`);
    }
  }

  console.log("Thumbnail update complete! 🚀");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

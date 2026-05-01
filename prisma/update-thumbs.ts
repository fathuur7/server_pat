import { prisma } from '../src/utils/prisma';

async function updateThumbnails() {
  const updates = [
    { title: 'Naruto',              thumb: '/uploads/thumbnails/naruto_thumbnail.png' },
    { title: 'The Great Adventure', thumb: '/uploads/thumbnails/fantasy_thumbnail.png' },
    { title: 'Space Explorers',     thumb: '/uploads/thumbnails/scifi_thumbnail.png' },
    { title: 'Comedy Central',      thumb: '/uploads/thumbnails/comedy_thumbnail.png' },
    { title: 'Action Heroes',       thumb: '/uploads/thumbnails/action_thumbnail.png' },
    { title: 'Midnight Horror',     thumb: '/uploads/thumbnails/horror_thumbnail.png' },
  ];

  for (const u of updates) {
    const videoResult = await prisma.video.updateMany({
      where: { title: u.title },
      data: { thumbnailUrl: u.thumb },
    });
    console.log(`✅ Updated video "${u.title}": ${videoResult.count} rows`);

    const episodeResult = await prisma.episode.updateMany({
      where: { video: { title: u.title } },
      data: { thumbnailUrl: u.thumb },
    });
    console.log(`   ↳ Updated episodes: ${episodeResult.count} rows`);
  }

  console.log('\n🎉 All thumbnails updated successfully!');
}

updateThumbnails()
  .catch(console.error)
  .finally(() => process.exit(0));

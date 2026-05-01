import 'dotenv/config';
import { prisma } from '../src/utils/prisma';
import { processEpisodeToHLS } from '../src/services/video.service';
import path from 'path';

async function run() {
  const naruto = await prisma.video.findFirst({ where: { title: 'Naruto' } });
  if (!naruto) {
    console.log('Naruto series not found!');
    return;
  }

  const baseDir = 'C:\\Users\\kopis\\OneDrive\\Documents\\PAT\\project\\server\\data-vidio\\[Kuso] Naruto 01-50';

  for (let i = 1; i <= 10; i++) {
    const epNumStr = i.toString().padStart(2, '0');
    const filename = `[Kusonime] Naruto - ${epNumStr}.mkv`;
    const videoPath = path.join(baseDir, filename);

    console.log(`\n=========================================`);
    console.log(`Processing Episode ${i}...`);
    console.log(`=========================================`);

    // Upsert episode
    // Note: We don't have a unique constraint on videoId_episodeNumber out of the box in the initial schema unless I added it?
    // Let's check schema.prisma
    let episode = await prisma.episode.findFirst({
      where: { videoId: naruto.id, episodeNumber: i }
    });

    if (episode) {
      episode = await prisma.episode.update({
        where: { id: episode.id },
        data: { status: 'PROCESSING', title: `Episode ${i}` }
      });
    } else {
      episode = await prisma.episode.create({
        data: {
          videoId: naruto.id,
          episodeNumber: i,
          title: `Episode ${i}`,
          status: 'PROCESSING',
        }
      });
    }

    try {
      await processEpisodeToHLS(episode.id, videoPath, true);
      console.log(`✅ Finished Episode ${i}`);
    } catch (err) {
      console.error(`❌ Failed Episode ${i}:`, err);
    }
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());

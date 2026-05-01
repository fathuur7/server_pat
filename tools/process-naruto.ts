import { prisma } from '../src/utils/prisma';
import { processEpisodeToHLS } from '../src/services/video.service';
import path from 'path';

async function processNaruto() {
  const naruto = await prisma.video.findFirst({ where: { title: 'Naruto' } });
  if (!naruto) return console.log('Naruto not found');

  const ep1 = await prisma.episode.findFirst({ where: { videoId: naruto.id, episodeNumber: 1 } });
  if (!ep1) return console.log('Episode 1 not found');

  const videoPath = 'C:\\Users\\kopis\\OneDrive\\Documents\\PAT\\project\\server\\data-vidio\\[Kuso] Naruto 01-50\\[Kusonime] Naruto - 01.mkv';

  console.log(`Starting processing for Episode 1 (ID: ${ep1.id}) from ${videoPath}...`);

  // Set to PROCESSING
  await prisma.episode.update({
    where: { id: ep1.id },
    data: { status: 'PROCESSING' }
  });

  // Call the service (it updates DB to READY when done)
  try {
    await processEpisodeToHLS(ep1.id, videoPath, false);
    console.log('Finished processing!');
  } catch (err) {
    console.error('Failed to process:', err);
  }
}

processNaruto().finally(() => prisma.$disconnect());

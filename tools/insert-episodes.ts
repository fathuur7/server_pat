import 'dotenv/config';
import { prisma } from '../src/utils/prisma';

async function run() {
  const naruto = await prisma.video.findFirst({ where: { title: 'Naruto' } });
  if (!naruto) return;
  for (let i = 1; i <= 10; i++) {
    const exists = await prisma.episode.findFirst({ where: { videoId: naruto.id, episodeNumber: i } });
    if (!exists) {
      await prisma.episode.create({
        data: {
          videoId: naruto.id,
          episodeNumber: i,
          title: 'Episode ' + i,
          status: 'PROCESSING'
        }
      });
      console.log('Inserted Episode', i);
    }
  }
}
run().finally(() => prisma.$disconnect());

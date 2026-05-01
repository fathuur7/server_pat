import { prisma } from '../src/utils/prisma';
async function fix() {
  const videos = await prisma.video.findMany({ include: { episodes: true } });
  for (const v of videos) {
    if (v.episodes.length > 0) {
      const v1 = Math.floor(v.views * 0.8);
      const v2 = v.views - v1;
      if (v.episodes[0]) await prisma.episode.update({ where: { id: v.episodes[0].id }, data: { views: v1 } });
      if (v.episodes[1]) await prisma.episode.update({ where: { id: v.episodes[1].id }, data: { views: v2 } });
    }
  }
  console.log('Done!');
}
fix().catch(console.error).finally(() => prisma.$disconnect());

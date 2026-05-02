import { prisma } from '../src/utils/prisma';
import bcrypt from 'bcryptjs';

// ── Helpers ───────────────────────────────────────────────────────────────────

async function upsertGenre(name: string) {
  return prisma.genre.upsert({
    where: { name },
    update: {},
    create: { name },
  });
}

async function createVideo(
  title: string,
  description: string,
  thumbnailUrl: string,
  views: number,
  likes: number,
  authorId: string,
  status: 'ONGOING' | 'COMPLETED',
  genreNames: string[],
) {
  const existing = await prisma.video.findFirst({ where: { title } });
  if (existing) {
    console.log(`  ⏭  Skipping "${title}" (already exists)`);
    return existing;
  }

  const genres = await Promise.all(genreNames.map(upsertGenre));
  const video = await prisma.video.create({
    data: {
      title,
      description,
      thumbnailUrl,
      views,
      likes,
      status,
      authorId,
      genres: { connect: genres.map((g: any) => ({ id: g.id })) },
    },
  });
  console.log(`  ✅ Created video: ${video.title}`);
  return video;
}

async function addEpisodes(
  videoId: string,
  count: number,
  thumbnailUrl: string,
) {
  const existingCount = await prisma.episode.count({ where: { videoId } });
  if (existingCount > 0) return;

  const episodes = Array.from({ length: count }, (_, i) => ({
    episodeNumber: i + 1,
    title: `Episode ${i + 1}`,
    thumbnailUrl,
    status: 'READY' as const,
    videoId,
    views: Math.floor(Math.random() * 5000),
    likes: Math.floor(Math.random() * 500),
  }));

  await prisma.episode.createMany({ data: episodes });
  console.log(`    └─ Added ${count} episodes`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🌱 Starting NadaSaku database seed...\n');

  // ── 1. Users ──────────────────────────────────────────────────────────────────
  console.log('👤 Creating users...');
  const hashedPw = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@nadasaku.com' },
    update: {},
    create: {
      name: 'NadaSaku Admin',
      email: 'admin@nadasaku.com',
      password: hashedPw,
      role: 'content_creator',
    },
  });
  console.log(`  ✅ Admin: ${admin.email}`);

  const creator = await prisma.user.upsert({
    where: { email: 'creator@nadasaku.com' },
    update: {},
    create: {
      name: 'Studio NadaSaku',
      email: 'creator@nadasaku.com',
      password: hashedPw,
      role: 'content_creator',
    },
  });
  console.log(`  ✅ Creator: ${creator.email}`);

  const testUser = await prisma.user.upsert({
    where: { email: 'user@nadasaku.com' },
    update: {},
    create: {
      name: 'Test User',
      email: 'user@nadasaku.com',
      password: hashedPw,
      role: 'user',
    },
  });
  console.log(`  ✅ Test user: ${testUser.email}\n`);

  // ── 2. Genres ────────────────────────────────────────────────────────────────
  console.log('🏷️  Upserting genres...');
  const genres = ['ACTION', 'COMEDY', 'DRAMA', 'FANTASY', 'HORROR', 'MYSTERY', 'ROMANCE', 'SCI-FI', 'SLICE OF LIFE', 'THRILLER', 'MOVIE'];
  for (const g of genres) await upsertGenre(g);
  console.log(`  ✅ ${genres.length} genres ready\n`);

  // ── 3. Series ────────────────────────────────────────────────────────────────
  console.log('📺 Creating series...');

  const naruto = await createVideo(
    'Naruto',
    'Naruto Uzumaki adalah seorang ninja muda dari Desa Daun yang menyimpan rubah ekor sembilan dalam tubuhnya. Ia berjuang untuk diakui dan bermimpi menjadi Hokage—pemimpin desanya.',
    'https://upload.wikimedia.org/wikipedia/en/9/94/NarutoPart1.jpg',
    125000, 4800, creator.id, 'COMPLETED', ['ACTION', 'COMEDY', 'DRAMA'],
  );
  await addEpisodes(naruto.id, 24, naruto.thumbnailUrl ?? '');

  const attackOnTitan = await createVideo(
    'Attack on Titan',
    'Manusia tinggal di balik tembok raksasa untuk berlindung dari Titan—makhluk pemangsa manusia. Saat Titan membobol tembok, Eren Yeager bersumpah akan membasmi semuanya.',
    'https://upload.wikimedia.org/wikipedia/en/thumb/d/de/Shingeki_no_Kyojin_manga_volume_1.jpg/250px-Shingeki_no_Kyojin_manga_volume_1.jpg',
    250000, 9200, creator.id, 'COMPLETED', ['ACTION', 'DRAMA', 'THRILLER'],
  );
  await addEpisodes(attackOnTitan.id, 25, attackOnTitan.thumbnailUrl ?? '');

  const jjk = await createVideo(
    'Jujutsu Kaisen',
    'Yuji Itadori adalah siswa SMA yang menelan jari Ryomen Sukuna—raja kutukan. Ia bergabung dengan organisasi jujutsu rahasia untuk melawan kutukan sembari mencari sisa jari Sukuna.',
    'https://upload.wikimedia.org/wikipedia/en/2/2b/Jujutsu_Kaisen_manga_volume_1_cover.jpg',
    310000, 11500, creator.id, 'ONGOING', ['ACTION', 'HORROR', 'FANTASY'],
  );
  await addEpisodes(jjk.id, 24, jjk.thumbnailUrl ?? '');

  const demon = await createVideo(
    'Demon Slayer',
    'Tanjiro Kamado menjadi pemburu iblis setelah keluarganya dibantai dan adiknya Nezuko berubah menjadi iblis. Ia berjuang untuk menemukan obat yang bisa mengembalikan adiknya.',
    'https://upload.wikimedia.org/wikipedia/en/2/25/DemonSlayerMangaVolume1.png',
    280000, 10400, creator.id, 'ONGOING', ['ACTION', 'DRAMA', 'FANTASY'],
  );
  await addEpisodes(demon.id, 26, demon.thumbnailUrl ?? '');

  const onepiece = await createVideo(
    'One Piece',
    'Monkey D. Luffy berlayar menuju Grand Line untuk menemukan harta legendaris "One Piece" dan menjadi Raja Bajak Laut. Bersama krunya, ia menghadapi musuh yang semakin kuat.',
    'https://upload.wikimedia.org/wikipedia/en/9/90/One_Piece%2C_Volume_61_Cover_%28Japanese%29.jpg',
    500000, 18700, creator.id, 'ONGOING', ['ACTION', 'COMEDY', 'FANTASY'],
  );
  await addEpisodes(onepiece.id, 48, onepiece.thumbnailUrl ?? '');

  const bocchi = await createVideo(
    'Bocchi the Rock!',
    'Hitori Gotoh—dikenal sebagai "Bocchi-chan"—adalah gadis pemalu yang bermimpi menjadi gitaris terkenal. Ia bergabung dengan sebuah band dan berjuang mengatasi kecemasan sosialnya.',
    'https://upload.wikimedia.org/wikipedia/en/9/96/Bocchi_the_Rock_manga_volume_1.png',
    98000, 6200, creator.id, 'COMPLETED', ['COMEDY', 'SLICE OF LIFE', 'DRAMA'],
  );
  await addEpisodes(bocchi.id, 12, bocchi.thumbnailUrl ?? '');

  const spy = await createVideo(
    'Spy x Family',
    'Agen rahasia "Loid Forger" harus membangun keluarga palsu—termasuk mengadopsi anak yang ternyata seorang pembaca pikiran—demi menjalankan misinya.',
    'https://upload.wikimedia.org/wikipedia/en/4/4e/Spy_x_Family_volume_1_cover.jpg',
    175000, 7800, creator.id, 'ONGOING', ['ACTION', 'COMEDY', 'ROMANCE'],
  );
  await addEpisodes(spy.id, 25, spy.thumbnailUrl ?? '');

  const re0 = await createVideo(
    'Re:Zero − Starting Life in Another World',
    'Natsuki Subaru tiba-tiba dipindahkan ke dunia fantasi. Satu-satunya kemampuannya adalah "Return by Death"—ia kembali ke titik tertentu setiap kali mati.',
    'https://upload.wikimedia.org/wikipedia/en/f/f3/Re_Zero_Starting_Life_in_Another_World_light_novel_volume_1_cover.jpg',
    145000, 5600, creator.id, 'ONGOING', ['FANTASY', 'DRAMA', 'THRILLER'],
  );
  await addEpisodes(re0.id, 25, re0.thumbnailUrl ?? '');

  console.log('\n🎬 Creating movies...');

  const dragonball = await createVideo(
    'Dragon Ball Super: Broly',
    'Goku dan Vegeta menghadapi Broly—seorang Saiyan legendaris yang tumbuh sendirian di planet tandus. Pertarungan epik mempertaruhkan keselamatan seluruh galaksi.',
    'https://upload.wikimedia.org/wikipedia/en/5/53/DBSBrolyFilmPoster.jpg',
    190000, 8100, creator.id, 'COMPLETED', ['ACTION', 'FANTASY', 'MOVIE'],
  );
  await addEpisodes(dragonball.id, 1, dragonball.thumbnailUrl ?? '');

  const jjkmovie = await createVideo(
    'Jujutsu Kaisen 0: The Movie',
    'Yuta Okkotsu dihantui oleh roh kekasihnya Rika yang berubah menjadi kutukan dahsyat. Ia bergabung dengan Sekolah Jujutsu Tinggi untuk mengendalikan kekuatannya.',
    'https://upload.wikimedia.org/wikipedia/en/3/3b/Jujutsu_Kaisen_0_poster.jpg',
    220000, 9500, creator.id, 'COMPLETED', ['ACTION', 'HORROR', 'DRAMA', 'MOVIE'],
  );
  await addEpisodes(jjkmovie.id, 1, jjkmovie.thumbnailUrl ?? '');

  const your_name = await createVideo(
    'Your Name (Kimi no Na wa)',
    'Dua remaja—Mitsuha di desa pegunungan dan Taki di Tokyo—misterius bertukar tubuh secara acak. Saat mereka berusaha bertemu, mereka menyadari ada sesuatu yang lebih besar yang menghubungkan mereka.',
    'https://upload.wikimedia.org/wikipedia/en/0/0b/Your_Name_poster.png',
    340000, 14200, creator.id, 'COMPLETED', ['ROMANCE', 'DRAMA', 'FANTASY', 'MOVIE'],
  );
  await addEpisodes(your_name.id, 1, your_name.thumbnailUrl ?? '');

  const demon_movie = await createVideo(
    'Demon Slayer: Mugen Train',
    'Tanjiro dan kawan-kawannya bergabung dengan Hashira Api—Rengoku Kyojuro—dalam sebuah misi di atas Kereta Tanpa Batas yang diteror oleh iblis kuat.',
    'https://upload.wikimedia.org/wikipedia/en/c/ce/Kimetsu_no_Yaiba_-_Mugen_Ressha-Hen_poster.jpg',
    410000, 16300, creator.id, 'COMPLETED', ['ACTION', 'DRAMA', 'FANTASY', 'MOVIE'],
  );
  await addEpisodes(demon_movie.id, 1, demon_movie.thumbnailUrl ?? '');

  console.log('\n🎉 Seeding complete!');
  console.log('\n📋 Credentials:');
  console.log('  Admin        → admin@nadasaku.com   / password123');
  console.log('  Creator      → creator@nadasaku.com / password123');
  console.log('  Test User    → user@nadasaku.com    / password123');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

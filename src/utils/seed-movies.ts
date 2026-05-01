import { prisma } from "./prisma";

const MOVIES_DATA = [
  {
    title: "Kimi no Na wa (Your Name)",
    description: "Two strangers find themselves linked in a bizarre way. When a connection forms, will distance be the only thing to keep them apart?",
    genres: ["MOVIE", "ROMANCE", "DRAMA", "FANTASY"]
  },
  {
    title: "Spirited Away",
    description: "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts.",
    genres: ["MOVIE", "FANTASY", "ADVENTURE", "FAMILY"]
  },
  {
    title: "Suzume no Tojimari",
    description: "A modern action adventure road story where a 17-year-old girl named Suzume helps a mysterious young man close doors from the other side that are releasing disasters all over in Japan.",
    genres: ["MOVIE", "FANTASY", "ADVENTURE"]
  },
  {
    title: "Jujutsu Kaisen 0",
    description: "Yuta Okkotsu gains control of an extremely powerful, cursed spirit and gets enrolled in the Tokyo Prefectural Jujutsu High School by sorcerers to help him control his power.",
    genres: ["MOVIE", "ACTION", "FANTASY"]
  },
  {
    title: "One Piece Film: Red",
    description: "For the first time ever, Uta - the most beloved singer in the world - will reveal herself to the world at a live concert. The voice that the whole world has been waiting for is about to resound.",
    genres: ["MOVIE", "ACTION", "ADVENTURE", "MUSIC"]
  },
  {
    title: "Demon Slayer: Mugen Train",
    description: "After his family was brutally murdered and his sister turned into a demon, Tanjiro Kamado's journey as a demon slayer began. Tanjiro and his comrades embark on a new mission aboard the Mugen Train.",
    genres: ["MOVIE", "ACTION", "FANTASY", "THRILLER"]
  }
];

async function main() {
  console.log("Seeding movie data...");

  let author = await prisma.user.findFirst({
    where: { role: "content_creator" }
  });

  if (!author) {
    author = await prisma.user.create({
      data: {
        name: "Admin Creator",
        email: "admin@nadasaku.com",
        password: "password123",
        role: "content_creator"
      }
    });
  }

  for (let i = 0; i < MOVIES_DATA.length; i++) {
    const item = MOVIES_DATA[i];
    const thumbnailUrl = `https://picsum.photos/seed/${encodeURIComponent(item.title)}/800/450`;

    const genreConnections = item.genres.map((g) => ({
      where: { name: g },
      create: { name: g }
    }));

    const video = await prisma.video.create({
      data: {
        title: item.title,
        description: item.description,
        thumbnailUrl,
        status: "COMPLETED",
        authorId: author.id,
        genres: {
          connectOrCreate: genreConnections
        }
      }
    });
    console.log(`- Inserted Movie: ${video.title}`);
  }

  console.log("Movies Seeding complete! 🚀");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

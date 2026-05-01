import { prisma } from "./prisma";

const GENRES = [
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Sci-Fi",
  "Fantasy",
  "Horror",
  "Thriller",
  "Romance",
  "Mystery",
  "Crime",
  "Animation",
  "Family",
  "Documentary",
  "Music",
  "History",
  "War",
  "Western",
  "Sports",
  "Superhero",
];

async function main() {
  console.log("Seeding genres...");

  for (const genreName of GENRES) {
    const name = genreName.toUpperCase();
    await prisma.genre.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    console.log(`- Upserted: ${name}`);
  }

  console.log("Seeding complete! 🚀");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { prisma } from "./prisma";
import { VideoStatus } from "@prisma/client";

const SERIES_DATA = [
  {
    title: "Great Teacher Onizuka",
    description: "About Eikichi Onizuka, a 22-year-old ex-gangster member and a virgin. He has one ambition that no one ever expected from him. His sole life purpose is to become the greatest high school teacher ever.",
    genres: ["COMEDY", "DRAMA"]
  },
  {
    title: "Nichijou: My Ordinary Life",
    description: "Follow the adventures of three ordinary girls as they learn their most important lessons the hard way. Meanwhile, a pocket-sized professor makes life difficult for a robot who just wants to be normal.",
    genres: ["COMEDY", "ANIMATION"]
  },
  {
    title: "Kaguya-sama: Love Is War",
    description: "The proudly privileged top two students of an elite school each makes it their mission to be the first to extract a confession of love from the other.",
    genres: ["COMEDY", "ROMANCE"]
  },
  {
    title: "Gintama",
    description: "In an era where aliens have invaded and taken over feudal Tokyo, an unemployed samurai finds work however he can.",
    genres: ["ACTION", "COMEDY", "SCI-FI"]
  },
  {
    title: "Bocchi the Rock!",
    description: "Hitori \"Bocchi-chan\" Gotoh is a lonely high school girl whose heart lies in her guitar. One day, she meets Nijika Ijichi and joins 'Kessoku Band'. After that, her daily life starts to change little by little.",
    genres: ["COMEDY", "MUSIC"]
  },
  {
    title: "Grand Blue Dreaming",
    description: "A college student spends his year at the seaside town of Izu, having fun on the beach with his school friends.",
    genres: ["COMEDY"]
  },
  {
    title: "Spy x Family",
    description: "A spy on an undercover mission gets married and adopts a child as part of his cover. His wife and daughter have secrets of their own, and all three must strive to keep together.",
    genres: ["ACTION", "COMEDY", "FAMILY"]
  },
  {
    title: "Bakuman.",
    description: "Mahiro and Takagi team up to pursue their dreams of making it in the manga industry while sharing experiences, successes and failures along the way.",
    genres: ["DRAMA", "COMEDY"]
  },
  {
    title: "Assassination Classroom",
    description: "A powerful creature claims that within a year, Earth will be destroyed by him, but he offers mankind a chance by becoming a homeroom teacher where he teaches his students about how to kill him. An assassination classroom begins.",
    genres: ["ACTION", "COMEDY", "SCI-FI"]
  },
  {
    title: "Konosuba: God's Blessing on This Wonderful World!",
    description: "It was a happy day for Kazuma - right up to the moment he died. A goddess intervenes and offers him a second chance in a magical land.",
    genres: ["ADVENTURE", "COMEDY", "FANTASY"]
  },
  {
    title: "The Tatami Galaxy",
    description: "When a nameless student at Kyoto University encounters a demigod one night, he asks to relive the past three years in order to win the heart of Ms. Akashi, the object of his affection.",
    genres: ["COMEDY", "MYSTERY", "ROMANCE"]
  },
  {
    title: "Daily Lives of High School Boys",
    description: "Join Tadakuni, Hidenori and Yoshitake as they undergo the trials and tribulations of life in high school!.",
    genres: ["COMEDY"]
  },
  {
    title: "Mob Psycho 100",
    description: "A psychic middle school boy tries to live a normal life and keep his growing powers under control, even though he constantly gets into trouble.",
    genres: ["ACTION", "COMEDY", "SUPERNATURAL"]
  },
  {
    title: "Delicious in Dungeon",
    description: "Can sisters be reincarnated from dragon meat? Laios and his friends Marcille and Chilchuck delve into an endless dungeon in search of his fallen sister, fighting monsters, starvation, and corruption.",
    genres: ["ADVENTURE", "COMEDY", "FANTASY"]
  },
  {
    title: "The Dangers in My Heart",
    description: "Fascinated by the macabre, Kyotaro fantasizes about acting on his twisted thoughts to the detriment of his classmates. His heart was dark until an encounter with Anna lit a spark within it in a classic tale of boy meets girl.",
    genres: ["COMEDY", "ROMANCE"]
  },
  {
    title: "The Disastrous Life of Saiki K.",
    description: "Saiki Kusuo is a powerful psychic who hates attracting attention, yet he is surrounded by colorful characters who always find a way to remove him from his everyday life.",
    genres: ["COMEDY", "SCI-FI"]
  },
  {
    title: "Asobi Asobase: Workshop of Fun",
    description: "Three wildly different 8th graders create a \"pastimes\" club to get through the absurdity of middle school. Or something. They just want to have fun.",
    genres: ["COMEDY"]
  },
  {
    title: "Bakemonogatari",
    description: "Third-year high school student Koyomi Araragi is human again. Cured of his vampirism, he seeks to help other supernaturals with their problems. Koyomi becomes involved in their lives, revealing secrets in people he once knew.",
    genres: ["MYSTERY", "ROMANCE", "SUPERNATURAL"]
  },
  {
    title: "K-On!",
    description: "K-ON is about 5 high school girls who become friends through the Light Music Club. Yui the lead guitarist, Tsumugi the keyboardist, Mio the bassist, Azusa the rhythm guitarist, and Ritsu the drummer. K-ON is the story of 5 aspiring musicians and their journey through high school together.",
    genres: ["COMEDY", "MUSIC"]
  },
  {
    title: "A Place Further Than the Universe",
    description: "A group of high school girls join an expedition headed towards the Antarctic.",
    genres: ["ADVENTURE", "COMEDY", "DRAMA"]
  },
  {
    title: "Space Brothers",
    description: "Two brothers witness a UFO, sparking their dream of space travel. Years later, the younger brother pursues being an astronaut while the older regains his drive and applies to the space agency, hoping to fulfill their childhood promise.",
    genres: ["COMEDY", "SCI-FI", "DRAMA"]
  },
  {
    title: "Kamisama Kiss",
    description: "Nanami is left homeless after her father runs away due to debts. When she saves a man named Mikage from dogs, he gives her his house which turns out to be a shrine and she becomes the new deity.",
    genres: ["COMEDY", "FANTASY", "ROMANCE"]
  },
  {
    title: "Karakai Jouzu no Takagi-san",
    description: "If you blush, you lose. Nishikata has been teased mercilessly by Takagi and always winds up blushing! But he vows to one day get back at her.",
    genres: ["COMEDY", "ROMANCE"]
  },
  {
    title: "My Teen Romantic Comedy SNAFU",
    description: "About an antisocial high school student named Hikigaya Hachiman with a distorted view on life and no friends or girlfriend. His life change when he was forced to enter the \"Volunteer Service Club\" by his teacher.",
    genres: ["COMEDY", "DRAMA", "ROMANCE"]
  },
  {
    title: "Welcome to the N.H.K.",
    description: "This surreal dramedy follows Satou Tatsuhiro as he attempts to escape the evil machinations of the NHK.",
    genres: ["COMEDY", "DRAMA", "ROMANCE"]
  },
  {
    title: "SKET Dance",
    description: "A school club dedicated to helping others, with the technological genius Kazuyoshi \"Switch\" Usui as a brain, Hime \"Himeko\" Onizuka as a muscle, and Yusuke \"Bossun\" Fujisaki as their leader.",
    genres: ["COMEDY"]
  },
  {
    title: "Space Dandy",
    description: "The cosmic and comic adventures of Space Dandy, a handsome space explorer tasked to tour the universe and discover new alien beings.",
    genres: ["ADVENTURE", "COMEDY", "SCI-FI"]
  },
  {
    title: "Silver Spoon",
    description: "In order to escape his stressful city life, Hachiken enrolls in an agricultural school where he must learn a whole new way of life alongside a colorful cast of characters.",
    genres: ["COMEDY", "DRAMA"]
  },
  {
    title: "Shirobako",
    description: "A group of friends move to Tokyo and get jobs in the anime industry.",
    genres: ["COMEDY", "DRAMA"]
  },
  {
    title: "Maison Ikkoku",
    description: "The misadventures of a young student and his landlady's romance.",
    genres: ["COMEDY", "DRAMA", "ROMANCE"]
  },
  {
    title: "XXXHOLiC",
    description: "Kimihiro Watanuki, a high-schooler, is troubled by monsters and spirits, but meets Yuko Ichihara, a beautiful witch, who grants his wish to not be able to see them. However, there is a price.",
    genres: ["COMEDY", "DRAMA", "MYSTERY"]
  }
];

async function main() {
  console.log("Seeding series data...");

  // 1. Get or create a dummy author user
  let author = await prisma.user.findFirst({
    where: { role: "content_creator" }
  });

  if (!author) {
    author = await prisma.user.create({
      data: {
        name: "Admin Creator",
        email: "admin@nadasaku.com",
        password: "password123", // dummy
        role: "content_creator"
      }
    });
    console.log("Created dummy content_creator user");
  }

  // 2. Loop and seed videos
  for (let i = 0; i < SERIES_DATA.length; i++) {
    const item = SERIES_DATA[i];
    
    // Generate a random picsum image for thumbnail based on index
    const thumbnailUrl = `https://picsum.photos/seed/${encodeURIComponent(item.title)}/800/450`;

    // Map genres (connectOrCreate)
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
    console.log(`- Inserted Series: ${video.title}`);
  }

  console.log("Series Seeding complete! 🚀");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

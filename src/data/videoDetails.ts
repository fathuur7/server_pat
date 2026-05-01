import type { VideoDetail } from "../types";

export const videoDetails: Record<string, VideoDetail> = {
  "neon-vigilante-ep04": {
    id: "neon-vigilante-ep04",
    seriesTitle: "The Neon Vigilante",
    episodeNumber: 4,
    title: "The Neon Vigilante: Episode 04",
    description:
      "As the sun sets over Cyber-City, Jax finds himself cornered in the old docks. Will he use the experimental suit power or face the Shadow Syndicate head-on? Don't miss this explosive showdown!",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDaFgbiT8JPgaspsh1cZJX7R8Ihn4EcNjvhm4Eyvo9T2gblhlFFIn2VWe0tBxN0tOzCvwF4iX1zR_T_GcvLu208a2lsxmm_zpVmIxGOpiza61r234ngP88Rx8yMgNzk6fgk-o1lfoFbFwyy8TZB7sjqpnAr5DJgoca8uSDfCWedFsR4KiCbUHsbrbHz2QJQ6Kfw9D9j-Oia_b1qGnxpb-jaPADmNK8JFPiy9QakzitpLeq84kEFuvjf5uDO5ll7jC3WkuoCAP68FGrG",
    alt: "The Neon Vigilante Hero Action",
    duration: "24:00",
    tags: ["ACTION", "SCI-FI"],
    rating: 4.9,
    reviewCount: "2.1k",
    episodes: [
      {
        id: "neon-vigilante-ep05",
        episodeNumber: 5,
        title: "THE HARBOR ESCAPE",
        duration: "22:18",
        thumbnail:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuB0IGfv-EbNhFVcYHg3t1u55Wk75IUtawRMfgNr_Pf8Qr-K4yUZAGcUDqS4UBXFnjwfWh11BzONvJCxNYL9rNg0403MC5hAPmMqcT6MoYO3NWbe0qIZmUC5JlQ72M2L5fFb-JDPLyYnc2OSb9WWtKoGWOFF01qk8qjy6ha-HsgYMAykcXhIKPPf2cM1XbjdQue9R4SII4qP-wVHPaVLAfo4Fd7pYLAFI6jjRBq-mKYhusq6FWa8HcIwELTNq5CAnf2R0myCJjnuBCFj",
        alt: "Thumbnail for episode 5",
      },
      {
        id: "neon-vigilante-ep06",
        episodeNumber: 6,
        title: "SHADOW PROTOCOL",
        duration: "19:44",
        thumbnail:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCV9erlptGGB-xiSu_8qNdNbFriRFfcAR0_L6cBBacSXwCK2V_z3jt2KcMPO4lADwahGc8y-thNRsNDNany1IZINqZiUai1KMK4NwbrtpmFZX77ufrJfMiWX7E2n1CuvttgztpFPyxv5Usbeaz5BCtnrTkbxU1r2WfkLZ2sz88CvU6VOv8a5wAOMT3ENvYZ8c29Za9mz7ZiDQ2kDVGMkQCBSm97OX3DwoomiVYMgFdk0EijqKjHw6nEaj9UjjTX5VH_L9fgazL2DZRK",
        alt: "Thumbnail for episode 6",
      },
      {
        id: "neon-vigilante-ep07",
        episodeNumber: 7,
        title: "FALLEN GIANTS",
        duration: "25:01",
        thumbnail:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAmIPJDHG_MwjsyVnWlsDyvnCDgiQ33iKsHekl1uBQ8xkea8fJk2jgHlFKMX9Mizc93qA04eRK4pWBRsw7KH0IxUTNp1A1YvCuJmpMeXXPYlUArBbF08hwtJk8mOpgFzW36wCuQCMhZEZq-nyqWX_nGe4HzlcKh4JDKoFntjncJ6Vthvb5JQU351OBX1Mhqg8EjPUcS_e-kY5Mw7GG0hh6t9j9Ym3z7_k_JU1lBqKhZ15-z3VZiTCejgyNMZHnW8l80tPGhwir57Lfc",
        alt: "Thumbnail for episode 7",
      },
    ],
  },
  "mech-warrior-chronicles": {
    id: "mech-warrior-chronicles",
    seriesTitle: "The Mech-Warrior Chronicles",
    episodeNumber: 1,
    title: "The Mech-Warrior Chronicles: Episode 01",
    description:
      "In a world where giant mechs rule the battlefield, young pilot Kai must master his inherited war machine before the enemy reaches the city walls. An epic journey of courage begins.",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuADlR0KPSP4GYNx7lRUOTYjVWXlXQsoFDkSCyoyCEvMF0Eq4BTK7ENTjQ-Vxwxs0coEnGyoLkbqRyGv7F_1rY4PsfFsnspBdsBpshA0zA2DA3fqGM-VX5BuoWveXL_Q3m4Y3U-agnkE9IxDbCdVP08ahiScrEKzhocgrREzHTm6ao7WIpGN8xP2koRpOwyLwySxKG8YChDNnU4-B3CwyNg6Gd-okIQverM26Xtb40WXpzCEubFUAnoZeSYdc95s03v2rtr9bIXnoVV2",
    alt: "Mech-Warrior illustration",
    duration: "22:04",
    tags: ["ACTION", "MECHA"],
    rating: 4.7,
    reviewCount: "1.8k",
    episodes: [],
  },
};

export function getVideoDetail(id: string): VideoDetail {
  return videoDetails[id] ?? videoDetails["neon-vigilante-ep04"];
}

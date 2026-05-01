import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import { prisma } from '../utils/prisma';

export const processEpisodeToHLS = async (
  episodeId: string,
  rawFilePath: string,
  generateThumbnail = true
) => {
  try {
    const outputDir = path.join(__dirname, `../../uploads/hls/${episodeId}`);
    const thumbnailDir = path.join(__dirname, `../../uploads/thumbnails`);

    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    if (!fs.existsSync(thumbnailDir)) fs.mkdirSync(thumbnailDir, { recursive: true });

    const m3u8Path = path.join(outputDir, 'index.m3u8');
    const thumbnailFilename = `ep-${episodeId}.jpg`;

    // Auto-generate thumbnail from video if none uploaded
    if (generateThumbnail) {
      await new Promise<void>((resolve, reject) => {
        ffmpeg(rawFilePath)
          .screenshots({
            timestamps: ['10%'],
            filename: thumbnailFilename,
            folder: thumbnailDir,
            size: '1280x720',
          })
          .on('end', () => resolve())
          .on('error', (err) => reject(err));
      });
    }

    // Transcode to HLS
    await new Promise<void>((resolve, reject) => {
      ffmpeg(rawFilePath)
        .outputOptions([
          '-profile:v baseline',
          '-level 3.0',
          '-s 1280x720',
          '-start_number 0',
          '-hls_time 10',
          '-hls_list_size 0',
          '-f hls',
        ])
        .output(m3u8Path)
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .run();
    });

    // Update episode record to READY
    await prisma.episode.update({
      where: { id: episodeId },
      data: {
        status: 'READY',
        hlsUrl: `/uploads/hls/${episodeId}/index.m3u8`,
        ...(generateThumbnail && {
          thumbnailUrl: `/uploads/thumbnails/${thumbnailFilename}`,
        }),
      },
    });

    console.log(`Episode ${episodeId} processed successfully.`);
  } catch (error) {
    console.error(`Error processing episode ${episodeId}:`, error);
    await prisma.episode.update({
      where: { id: episodeId },
      data: { status: 'FAILED' },
    }).catch(console.error);
  }
};

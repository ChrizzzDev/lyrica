import { Spotify, Lyrics, Poster } from 'beatprints.js';

export const spotify = new Spotify(
  process.env.SPOTIFY_CLIENT_ID!,
  process.env.SPOTIFY_CLIENT_SECRET!
);

export const lrc = new Lyrics();
export const poster = new Poster({ output: { type: 'buffer' } });
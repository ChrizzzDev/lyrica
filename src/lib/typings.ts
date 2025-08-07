import { AlbumMetadata, TrackMetadata } from "beatprints.js";

export interface Response {
  status: number;
  message?: string;
}

export interface LRCLibError {
  code: number;
  name: string;
  message: string;
}

export interface AlbumResponse extends Response {
  albums: AlbumMetadata[];
}

export interface TrackResponse extends Response {
  tracks: TrackMetadata[];
}

export interface LyricsReponse extends Response {
  isInstrumental: boolean;
  lyrics: string | string[];
}
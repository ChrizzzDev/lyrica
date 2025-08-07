import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const SpotifyURI = /spotify:(track|album):([0-9A-Za-z]{22})/;
export const SpotifyURL = /https:\/\/(open|play)\.spotify\.com(\/intl-\w{2})?\/(track|album)\/([0-9A-Za-z]{22})/;
export const SpotifyID = /([0-9A-Za-z]{22})/;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isSpotifyID(id: string) {
  const cleanId = id.split('?')[0];
  console.log(cleanId);

  if (cleanId.match(SpotifyURI)) {
    return true;
  } else if (cleanId.match(SpotifyURL)) {
    return true;
  } else if (cleanId.match(SpotifyID)) {
    return true;
  } else return false;
}

export function formatFileSize(bytes: number | null): string {
  if (!bytes) return '...';
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / 1048576).toFixed(1) + ' MB';
}
'use client';

import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription
} from '@ui/card';
import Image from 'next/image';
import type { AlbumMetadata } from 'beatprints.js';

type Props = {
  album: AlbumMetadata;
  onClick?: () => void;
};

export default function AlbumCard({ album, onClick }: Props) {
  return (
    <div
      className="cursor-pointer group w-full aspect-[3/4] perspective"
      onClick={onClick}
    >
      <div className="relative w-full h-full min-h-[450px] transition-transform duration-700 transform-style-preserve-3d group-hover:rotate-y-180 flex">
        {/* Front */}
        <Card className="absolute inset-0 border border-border/70 bg-background/95 shadow-2xl overflow-hidden flex flex-col rounded-2xl group-hover:border-primary/70 group-hover:shadow-primary/20">
          <CardHeader className="w-full relative aspect-square -mt-6">
            <Image
              src={album.image}
              alt={album.name}
              fill
              className="object-cover object-center group-hover:brightness-90 transition-all duration-300 rounded-t-2xl"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-1 p-4 pt-0 min-h-0">
            <CardTitle className="text-lg font-bold text-primary truncate">{'name' in album ? album.name : 'Unknown'}</CardTitle>
            {'artist' in album && (
              <CardDescription className="truncate text-sm text-muted-foreground">{album.artist}</CardDescription>
            )}
            <div className="mt-2 text-xs text-muted-foreground space-y-1">
              {'released' in album && (
                <div><span className="font-semibold">Released:</span> {album.released}</div>
              )}
              {'tracks' in album && (
                <div><span className="font-semibold">Tracks:</span> {album.tracks.length}</div>
              )}
              {'label' in album && (
                <div><span className="font-semibold">Label:</span> {album.label}</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Back */}
        <Card className="absolute inset-0 backface-hidden rotate-y-180 bg-background text-foreground border border-border/70 shadow-2xl rounded-2xl overflow-hidden p-4 flex flex-col">
          <CardTitle className="text-sm font-semibold mb-2 text-primary">Tracks</CardTitle>
          <CardContent className="flex-1 overflow-y-auto p-0 pr-1 text-sm space-y-1 min-h-0 scroll">
            {album.tracks?.length
              ? album.tracks.map((track, idx) => (
                <p key={idx}>
                  <span className="text-muted-foreground mr-1">{idx + 1}.</span>
                  {track}
                </p>
              ))
              : <p className="text-muted-foreground italic">No tracks available</p>
            }
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
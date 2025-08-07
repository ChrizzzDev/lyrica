import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription
} from "@ui/card";

import Image from "next/image";

import type { TrackMetadata } from "beatprints.js";

type Props = {
  track: TrackMetadata;
  onClick?: () => void;
}

export default function TrackCard({ track, onClick }: Props) {
  return (
    <Card
      onClick={onClick}
      className="cursor-pointer group hover:scale-[1.04] transition-transform duration-300 border border-border/70 bg-background/95 shadow-2xl overflow-hidden flex flex-col rounded-2xl hover:border-primary/70 hover:shadow-primary/20"
    >
      <CardHeader className="w-full relative aspect-square -mt-6">
        {'image' in track && (
          <Image
            src={track.image}
            alt={track.name}
            fill
            className="object-cover object-center group-hover:brightness-90 transition-all duration-300 rounded-t-2xl"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-1 p-4 pt-0">
        <CardTitle className="text-lg font-bold text-primary truncate">{'name' in track ? track.name : 'Unknown'}</CardTitle>
        {'artist' in track && (<CardDescription className="truncate text-sm text-muted-foreground">{track.artist}</CardDescription>)}
        <div className="mt-2 text-xs text-muted-foreground space-y-1">
          {'album' in track && (
            <div><span className="font-semibold">Album:</span> {track.album}</div>
          )}
          {'released' in track && (
            <div><span className="font-semibold">Released:</span> {track.released}</div>
          )}
          {'duration' in track && (
            <div><span className="font-semibold">Duration:</span> {track.duration}</div>
          )}
          {'label' in track && (
            <div><span className="font-semibold">Label:</span> {track.label}</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function trim(str: string): string {
  if (str.length > 20) {
    return str.slice(0, 17) + '...';
  }

  return str;
}
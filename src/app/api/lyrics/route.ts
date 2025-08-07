import { lrc } from "@/lib/beatprints";
import { NextRequest, NextResponse } from "next/server";
import type { LRCLibError } from "@/lib/typings";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const artist = searchParams.get('artist');
    const track = searchParams.get('track');

    if (!artist || !track) {
      return NextResponse.json({
        message: 'Invalid search query.'
      }, { status: 400 });
    }

    const metadata = { artist, name: track };

    const lyrics = await lrc.getLyrics(metadata);

    return NextResponse.json({
      isInstrumental: await lrc.checkInstrumental(metadata),
      lyrics: lyrics.length > 0 ? lyrics.split('\n') : ''
    }, { status: 200 });

  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "Track was not found") {
        return NextResponse.json({
          message: err.message
        }, { status: 404 });
      }

      return NextResponse.json({ message: err.message }, { status: 500 });
    }
  }
}
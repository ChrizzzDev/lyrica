import { poster } from "@/lib/beatprints";
import type { AlbumMetadata, TrackMetadata, PosterTrackOptions, PosterAlbumOptions } from "beatprints.js";
import { NextRequest, NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const data = formData.get('data');

    if (!data || !(data instanceof Blob)) {
      return NextResponse.json(
        { message: 'Missing or invalid "data" field in form.' },
        { status: 400 }
      );
    }

    const dataText = await data.text();
    const body = JSON.parse(dataText);

    const type = body.type as 'track' | 'album';

    // let pcoverBuffer: Buffer | null = null;
    // const pcoverFile = formData.get('pcover');
    // if (pcoverFile && pcoverFile instanceof Blob) {
    //   const arrayBuffer = await pcoverFile.arrayBuffer();
    //   pcoverBuffer = Buffer.from(arrayBuffer);
    // }

    let pcoverBuffer: Buffer | null = null;
    let coverUrl: string | null = null;

    const pcoverFile = formData.get('pcover');
    const urlValue = formData.get('coverUrl');

    if (urlValue && typeof urlValue === 'string' && urlValue.trim() !== '') {
      coverUrl = urlValue.trim();
    } else if (pcoverFile && pcoverFile instanceof Blob) {
      const arrayBuffer = await pcoverFile.arrayBuffer();
      pcoverBuffer = Buffer.from(arrayBuffer);
    }

    let result: Buffer;

    if (type === 'track') {
      const trackOpts: PosterTrackOptions = {
        ...body.options,
        pcover: coverUrl || pcoverBuffer,
      };
      const metadata = body.metadata as TrackMetadata;
      const lyrics = (body.lyrics as string[]).join('\n');

      console.log(metadata);

      result = await poster.track(metadata, lyrics, trackOpts);
    } else {
      const albumOpts: PosterAlbumOptions = {
        ...body.options,
        pcover: coverUrl || pcoverBuffer,
      };
      const metadata = body.metadata as AlbumMetadata;

      console.log(metadata);

      result = await poster.album(metadata, albumOpts);
    }

    return new NextResponse(result, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Length': result.byteLength.toString(),
      },
    });
  } catch (err: any) {
    console.error('Error generating poster:', err);
    return NextResponse.json(
      { message: err.message || 'Internal server error.' },
      { status: 500 }
    );
  }
}
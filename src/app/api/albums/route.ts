import { spotify } from "@/lib/beatprints";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '6');

    if (!search) {
      return NextResponse.json({
        message: 'Invalid search query.'
      }, { status: 400 });
    }

    if (spotify.isSpotifyID(search)) {
      
      return NextResponse.json({
        albums: [await spotify.getAlbum(search, 1)]
      });

    } else return NextResponse.json({
      albums: await spotify.getAlbum(search, limit)
    });
    
  } catch (err) {
    return NextResponse.json({
      message: err
    }, { status: 500 })
  }
}
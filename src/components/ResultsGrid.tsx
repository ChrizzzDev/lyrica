import AlbumCard from "@/components/AlbumCard";
import TrackCard from "@/components/TrackCard";
import { cn } from "@/lib/utils";
import type { AlbumMetadata, TrackMetadata } from "beatprints.js";

type Result = TrackMetadata | AlbumMetadata;

type ResultsGridProps = {
  results: Result[];
  onSelect: (result: Result) => void;
}

export default function ResultsGrid({ results, onSelect }: ResultsGridProps) {
  if (!results || results.length === 0) return null;

  return (
    <div className="mt-12 w-full max-w-6xl mb-6">
      <section>
        <h2
          className="flex justify-center text-3xl sm:text-5xl outer-glow uppercase mb-6 tracking-tight"
          style={{ fontFamily: 'var(--font-monoton)' }}
        >
          Results
        </h2>
      </section>

      <section
        key={results.map(r => r.id).join('-')}
        className={cn(
          "mt-6",
          results.length === 1
            ? "flex items-center justify-center"
            : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-8"
        )}
      >
        {results.map((r, i) => {
          const isAlbum = "tracks" in r;
          return (
            <div key={r.id} style={{ animationDelay: `${i * 200}ms` }} className="animate-fade-in-up max-h-auto">
              {isAlbum ? (
                <AlbumCard album={r as AlbumMetadata} onClick={() => onSelect(r)} />
              ) : (
                <TrackCard track={r as TrackMetadata} onClick={() => onSelect(r)} />
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}

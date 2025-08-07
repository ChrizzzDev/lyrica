import { Label } from "@ui/label";
import { Input } from "@ui/input";
import { Card, CardFooter, CardContent } from "@ui/card";
import { Button } from "@ui/button";
import { Tabs, TabsList, TabsTrigger } from "@ui/tabs";
import { Tooltip, TooltipTrigger, TooltipContent } from "@ui/tooltip";

import { Music2, Disc3, Loader2, Search } from "lucide-react";

interface Props {
  mode: 'track' | 'album';
  name: string;
  artist: string;
  spotifyId: string;
  searching: boolean;
  error?: string | null;
  idError?: string | null;
  handleSearch: () => void;
  onChange: (field: 'mode' | 'name' | 'artist' | 'spotifyId', value: string) => void;
}

export default function SearchForm({ mode, name, artist, spotifyId, searching, error, idError, handleSearch, onChange }: Props) {
  return (

    <div className="w-full max-w-xl">
      <Tabs defaultValue={mode} onValueChange={(v) => onChange('mode', v)}>
        <TabsList className="flex justify-center mb-4 gap-2">
          <TabsTrigger value="track" className="selected-tab"><Music2 /> Track</TabsTrigger>
          <TabsTrigger value="album" className="selected-tab"><Disc3 /> Album</TabsTrigger>
        </TabsList>
        <section className="animate-fade-in">
          <Card className="backdrop-blur-md shadow-xl border border-border/50 rounded-2xl transition-all hover:shadow-primary/[3%] hover:border-primary/40">
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="mb-1.5">{mode === 'track' ? "Track name" : "Album name"}</Label>
                  <Input
                    name="name"
                    value={name}
                    onChange={(e) => onChange("name", e.target.value)}
                    placeholder={mode === "track" ? "1960" : "ARMAGEDÓN"}
                    aria-autocomplete="none"
                  />
                </div>
                <div>
                  <Label htmlFor="artist" className="mb-1.5">Artist name</Label>
                  <Input
                    name="artist"
                    value={artist}
                    onChange={(e) => onChange("artist", e.target.value)}
                    placeholder="HUMBE"
                    aria-autocomplete="none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 justify-center text-xs text-muted-foreground">
                <span className="h-px w-full bg-border/60" /> OR <span className="h-px w-full bg-border/60" />
              </div>

              <div>
                <Tooltip>
                  <Label htmlFor="spotifyId" className="mb-1.5">
                    Spotify ID
                    <TooltipTrigger asChild>
                      <span
                        className="text-xs text-muted hover:text-primary/40 transition-colors duration-200"
                      >(ID/URI/URL)</span>
                    </TooltipTrigger>
                    <TooltipContent className="bg-background text-foreground/60 [&>span]:text-foreground [&>span]:font-bold">
                        <span>ID:</span> Ou5... <br />
                        <span>URL:</span> https://.../{mode}/Ou5... <br />
                        <span>URI:</span> spotify:{mode}:Ou5...
                    </TooltipContent>
                  </Label>
                  <Input
                    name="spotifyId"
                    value={spotifyId}
                    onChange={(e) => onChange("spotifyId", e.target.value)}
                    minLength={22}
                    placeholder="0u5..."
                    aria-autocomplete="none"
                  />
                </Tooltip>
              </div>

              {(error || idError) && (
                <p className="text-red-500 text-sm">{error || idError}</p>
              )}
            </CardContent>
            <CardFooter>
              <Button
                className="w-full hover:scale-[1.02] transition-transform duration-300 py-6 text-lg font-semibold rounded-xl group"
                disabled={searching}
                onClick={handleSearch}
              >
                {searching
                  ? (
                    <div className="flex items-center">
                      <Loader2 className="animate-spin mr-2" />
                      Searching...
                    </div>
                  )
                  : (
                    <div className="flex items-center">
                      <Search className="mr-2" />
                      Search
                    </div>
                  )
                }
              </Button>
            </CardFooter>
          </Card>
        </section>
      </Tabs>
    </div>
  );
}
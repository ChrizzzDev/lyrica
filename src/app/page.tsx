'use client';

import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Label } from "@ui/label";
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "@ui/select";
import ResultsGrid from "@/components/ResultsGrid";
import SearchForm from "@/components/SearchForm";

import { Loader2, Share2, X, History, Music } from 'lucide-react';

import { useEffect, useState } from "react";

import type { AlbumMetadata, TrackMetadata } from "beatprints.js";
import type { AlbumResponse, TrackResponse, LyricsReponse } from '@/lib/typings';

import { fetcher } from "@/lib/fetcher";
import { cn, formatFileSize, isSpotifyID } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@ui/tooltip";


const THEMES = ['Light', 'Dark', 'Catppuccin', 'Gruvbox', 'Nord', 'RosePine', 'Everforest'];
type Options = 'Light' | 'Dark' | 'Catppuccin' | 'Gruvbox' | 'Nord' | 'RosePine' | 'Everforest';

export default function Home() {
  const [name, setName] = useState('');
  const [artist, setArtist] = useState('');
  const [spotifyId, setSpotifyId] = useState('');
  const [mode, setMode] = useState<'track' | 'album'>('track');
  const [selected, setSelected] = useState<TrackMetadata | AlbumMetadata | null>(null);

  const [isInstrumental, setIsInstrumental] = useState(false);
  const [lrc, setLrc] = useState<string[] | null>(null);
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  const [selectedLyrics, setSelectedLyrics] = useState<number[]>([]);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [results, setResults] = useState<TrackMetadata[] | AlbumMetadata[]>([]);

  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [idError, setIdError] = useState<string | null>(null);
  const [modalType, setModalType] = useState<'noLyrics' | 'instrumental' | 'error' | null>(null);

  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [posterOptions, setPosterOptions] = useState<{
    palette: boolean;
    accent: boolean;
    theme: Options
    pcover: File | null;
    indexing: boolean;
  }>({
    palette: true,
    accent: true,
    theme: 'Light',
    pcover: null,
    indexing: false,
  });

  const [generating, setGenerating] = useState(false);
  const [posterImage, setPosterImage] = useState<string | null>(null);
  const [posterError, setPosterError] = useState<string | null>(null);
  const [posterSize, setPosterSize] = useState<number | null>(null);
  const [coverUrl, setCoverUrl] = useState('');

  const [history, setHistory] = useState<PosterHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const $fetch = fetcher('http://localhost:3000');

  useEffect(() => {
    const saved = localStorage.getItem('posterHistory');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (!showOptionsModal) {
      setCoverUrl('');
    }
  }, [showOptionsModal]);

  useEffect(() => {
    return () => {
      if (posterImage) URL.revokeObjectURL(posterImage);
    }
  }, [posterImage]);

  const handleGeneratePoster = async () => {
    setGenerating(true);
    setPosterError(null);
    setPosterImage(null);

    try {
      const formData = new FormData();

      const options: any = {
        palette: posterOptions.palette,
        accent: posterOptions.accent,
        theme: posterOptions.theme,
      };

      if (selected && 'tracks' in selected) {
        options.indexing = posterOptions.indexing;
      }

      const body: Record<string, any> = {
        type: selected && 'tracks' in selected ? 'album' : 'track',
        metadata: selected,
        options,
      };

      if (body.type === 'track') {
        body.lyrics = selectedLyrics.length > 0
          ? selectedLyrics.map(i => lrc![i])
          : ['Instrumental or no lyrics provided.'];
      }

      formData.append('data', new Blob([JSON.stringify(body)], { type: 'application/json' }));
      if (coverUrl.trim()) {
        formData.append('coverUrl', coverUrl.trim());
      } else if (posterOptions.pcover) {
        formData.append('pcover', posterOptions.pcover);
      }

      const res = await fetch('/api/poster', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        let errorMessage = 'Failed to generate poster';
        try {
          const errData = await res.json();
          errorMessage = errData.message || errorMessage;
        } catch (e) {
          try {
            const errText = await res.text();
            errorMessage = errText.slice(0, 100);
          } catch {
            errorMessage = `HTTP ${res.status}`;
          }
        }
        throw new Error(errorMessage);
      }

      const arrayBuffer = await res.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: 'image/png' });
      const url = URL.createObjectURL(blob);

      setPosterImage(url);
      setPosterSize(blob.size);

      const historyItem: PosterHistoryItem = {
        id: Date.now().toString(),
        name: selected?.name || 'Unknown',
        date: Date.now(),
        size: blob.size,
        payload: {
          type: selected && 'tracks' in selected ? 'album' : 'track',
          metadata: selected,
          options: {
            palette: posterOptions.palette,
            accent: posterOptions.accent,
            theme: posterOptions.theme,
            indexing: posterOptions.indexing
          },
        },
        coverUrl: coverUrl || null
      };

      const newHistory = [historyItem, ...history].slice(0, 10);
      setHistory(newHistory);
      localStorage.setItem('posterHistory', JSON.stringify(newHistory));
    } catch (err) {
      setPosterError(err instanceof Error ? err.message : 'Unknown error generating poster.');
    } finally {
      setGenerating(false);
    }
  };

  const finalizeSelection = () => {
    setPosterError(null);
    setPosterImage(null);
    setPosterSize(null);
    setGenerating(false);

    setShowOptionsModal(true);
  }

  function handleVerseClick(index: number) {
    if (selectedLyrics.length === 0) {
      setSelectedLyrics([index]);
      return;
    }

    const min = Math.min(...selectedLyrics);
    const max = Math.max(...selectedLyrics);

    if (index >= min && index <= max) {
      const newRange = [];
      for (let i = min; i <= max; i++) {
        if (i === index) continue;
        newRange.push(i);
      }
      setSelectedLyrics(newRange);
      return;
    }

    if (index === min - 1) {
      if (selectedLyrics.length < 4) {
        setSelectedLyrics([index, ...selectedLyrics]);
      }
      return;
    }

    if (index === max + 1) {
      if (selectedLyrics.length < 4) {
        setSelectedLyrics([...selectedLyrics, index]);
      }
      return;
    }

    setSelectedLyrics([index]);
  }


  const searchLyrics = async (track: TrackMetadata) => {
    setSelected(track);
    setShowLyrics(false);
    setSelectedLyrics([]);
    setLoadingLyrics(true);

    try {
      const res = await $fetch<LyricsReponse>('/api/lyrics', {
        searchParams: {
          artist: track.artist,
          track: track.name
        }
      });

      if (res.status === 200) {
        if (Array.isArray(res.lyrics) && res.lyrics.length > 0) {
          setLrc(res.lyrics);
          setIsInstrumental(false);
          setShowLyrics(true);
          setModalType(null);
        } else if (res.isInstrumental) {
          setIsInstrumental(true);
          setModalType('instrumental');
          setShowModal(true);
          finalizeSelection();
        } else {
          setModalType('noLyrics');
          setShowModal(true);
          finalizeSelection();
        }
      } else if (res.status === 404) {
        setModalType('noLyrics');
        setShowModal(true);
      } else {
        setModalType('error');
        setShowModal(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown lyrics error.');
    } finally {
      setLoadingLyrics(false);
    }
  }

  const handleSearch = async () => {
    setError(null);
    setIdError(null);

    console.log(spotifyId);

    if (spotifyId) {
      if (!isSpotifyID(spotifyId)) {
        setIdError(`Spotify ID is not valid.`);
        return;
      }
    } else if (!name || !artist) {
      setError('You must type a valid Spotify ID or both fields: name and artist.');
      return;
    }

    setSearching(true);

    try {
      const res = await $fetch<AlbumResponse | TrackResponse>(`/api/${mode}s`, {
        searchParams: {
          q: spotifyId ? spotifyId : `${name} - ${artist}`,
          limit: 8
        }
      });

      if (res.status !== 200) {
        setError(`${res.status}: ${res.message}`);
        return;
      }

      if (isTrack(res)) {
        setResults(res.tracks);
      } else if (isAlbum(res)) {
        setResults(res.albums);
      } else {
        setError('An error ocurred.');
      }

    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setSearching(false);
    }
  }

  const sharePost = async () => {
    if (!posterImage) return;

    const title = `My Echoica Poster`;
    const text = `Check out this lyrics poster I made with Echoica!`;

    if ('share' in navigator && navigator.canShare?.({ url: posterImage })) {
      try {
        await navigator.share({ title, text, url: posterImage });
        return;
      } catch { return }
    }

    // Fallback
    const tweetText = encodeURIComponent(`${text}\n\n${title}`);
    const tweetUrl = encodeURIComponent(posterImage);
    window.open(
      `https://x.com/intent/post?text=${tweetText}&url=${tweetUrl}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const reusePoster = async (item: PosterHistoryItem) => {
    setSelected(item.payload.metadata);
    setPosterOptions({
      palette: item.payload.options.palette,
      accent: item.payload.options.accent,
      theme: item.payload.options.theme,
      pcover: null,
      indexing: item.payload.options.indexing,
    });

    setCoverUrl(item.coverUrl || '');

    setShowHistory(false);

    await handleGeneratePoster();
  }

  const filename = selected?.name
    ? `echoica-poster-${selected.name.trim().replace(/\s+/g, '-').toLowerCase()}.png`
    : 'echoica-poster.png';

  return (
    <div className="bg-pattern min-h-screen w-full px-2 sm:px-4 flex flex-col items-center animate-fade-in">
      <section className="mb-10 text-center mt-8">
        <h1
          className="text-5xl sm:text-7xl uppercase text-center tracking-tight outer-glow animate-pulse-slow drop-shadow-xl"
          style={{ fontFamily: 'var(--font-monoton)' }}
        >
          Sonora
        </h1>
        {/* <p className="mt-2 text-lg text-muted-foreground font-medium">Fuck ZickTron</p> */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 left-4"
              onClick={() => setShowHistory(true)}
            >
              <History className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-background text-foreground">
            History
          </TooltipContent>
        </Tooltip>
      </section>

      {showHistory && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-background to-muted/20 border border-border/50 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-border/50">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Recent Posters
              </h2>
              <button
                onClick={() => setShowHistory(false)}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 p-4 overflow-y-auto max-h-80">
              {history.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Music className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  No posters yet
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {history.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => reusePoster(item)}
                      className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-muted/60 hover:scale-105 transition-all duration-300 hover:shadow-2xl outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      {/* Cover placeholder */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent flex items-center justify-center">
                        <div className="text-center p-4">
                          <div className="w-12 h-12 mx-auto mb-2 bg-primary/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Music className="h-6 w-6" />
                          </div>
                          <span className="text-xs font-medium text-foreground line-clamp-2">
                            {item.name}
                          </span>
                          <span className="block text-xs text-muted-foreground mt-1">
                            {item.payload.metadata?.artist}
                          </span>
                          <span className="block text-[10px] text-muted-foreground mt-1">
                            {new Date(item.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="text-white text-center">
                          <div className="w-10 h-10 mx-auto mb-1 bg-primary/30 rounded-full flex items-center justify-center">
                            <History className="w-5 h-5" />
                          </div>
                          <span className="text-xs">Reuse</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center p-4 border-t border-border/50 bg-muted/20">
              <span className="text-xs text-muted-foreground">
                {history.length} poster{history.length !== 1 ? 's' : ''}
              </span>
              {history.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs hover:text-red-500"
                  onClick={() => {
                    setHistory([]);
                    localStorage.removeItem('posterHistory');
                  }}
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <SearchForm
        mode={mode}
        name={name}
        artist={artist}
        spotifyId={spotifyId}
        searching={searching}
        error={error}
        idError={idError}
        handleSearch={handleSearch}
        onChange={(field, value) => {
          if (field === 'mode') setMode(value as 'track' | 'album');
          else if (field === 'name') setName(value);
          else if (field === 'artist') setArtist(value);
          else if (field === 'spotifyId') setSpotifyId(value);
        }}
      />

      {results.length > 0 && !showLyrics && !loadingLyrics && (
        <ResultsGrid
          results={results}
          onSelect={(item) => {
            const isAlbum = 'tracks' in item;

            if (isAlbum) {
              setSelected(item);
              finalizeSelection();
            } else searchLyrics(item);
          }}
        />
      )}

      {loadingLyrics && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center animate-fade-in">
          <div className="flex flex-col items-center gap-4 p-8 bg-background/80 rounded-2xl shadow-xl border border-border">
            <Loader2 className="animate-spin text-primary" size={40} />
            <span className="text-lg font-semibold text-primary">Searching lyrics...</span>
          </div>
        </div>
      )}

      {showOptionsModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-background border border-border rounded-2xl shadow-2xl p-8 w-full max-w-lg relative animate-fade-in-up">
            <Button
              variant="ghost"
              className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors text-2xl font-bold"
              onClick={() => {
                setShowOptionsModal(false);
              }}
              aria-label="Close"
            >
              <X />
            </Button>
            <h2 className="text-2xl font-bold mb-6 text-center">Customize Poster</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="palette" className="text-sm font-medium">Use Palette</Label>
                <Input
                  name="palette"
                  type="checkbox"
                  checked={posterOptions.palette}
                  onChange={(e) => setPosterOptions(prev => ({ ...prev, palette: e.target.checked }))}
                  className="w-4 h-4 accent-primary"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="accent" className="text-sm font-medium">Use Accent</Label>
                <Input
                  name="accent"
                  type="checkbox"
                  checked={posterOptions.accent}
                  onChange={(e) => setPosterOptions(prev => ({ ...prev, accent: e.target.checked }))}
                  className="w-4 h-4 accent-primary"
                />
              </div>
              <div>
                <Select
                  value={posterOptions.theme}
                  onValueChange={(e) => setPosterOptions(prev => ({ ...prev, theme: e as any }))}
                >
                  <SelectTrigger className="w-full p-2 border border-border rounded-lg bg-background">
                    <SelectValue placeholder="Theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {THEMES.map((v, i) => (
                      <SelectItem key={i} value={v} className="uppercase">{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="cover" className="text-sm font-medium block mb-2">Custom Cover (Optional)</Label>
                <Input
                  name="cover"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) setPosterOptions(prev => ({ ...prev, pcover: e.target.files![0] }));
                  }}
                  className="w-full"
                />
                <Input
                  type="url"
                  placeholder="https://imgur.com/..."
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  className="w-full mt-2 p-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/30"
                />
                {(coverUrl && !isValidImageUrl(coverUrl)) ? (
                  <p className="text-xs text-red-500 mt-1">This URL doesn't look like an image. If it's from Spotify or a similar service, it might still work.</p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">Paste a direct image URL</p>
                )}
              </div>
              {selected && 'tracks' in selected && (
                <div className="flex items-center justify-between">
                  <Label htmlFor="indexes" className="text-sm font-medium">Show Track Indexing</Label>
                  <Input
                    name="indexes"
                    type="checkbox"
                    checked={posterOptions.indexing}
                    onChange={(e) => setPosterOptions(prev => ({ ...prev, indexing: e.target.checked }))}
                    className="w-4 h-4 accent-primary"
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end mt-8 gap-3">
              <Button variant="outline" onClick={() => setShowOptionsModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleGeneratePoster}>
                {generating ? <Loader2 className="animate-spin mr-2" /> : null}
                Generate
              </Button>
            </div>
          </div>
        </div>
      )}

      {!isInstrumental && showLyrics && lrc && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-background border border-border rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative animate-fade-in-up">
            <Button
              variant="ghost"
              className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors text-2xl font-bold"
              onClick={() => {
                setShowLyrics(false);
                setSelected(null);
                setLrc(null);
                setSelectedLyrics([]);
              }}
              aria-label="Close"
            >
              <X />
            </Button>
            <h2 className="text-2xl font-bold uppercase mb-4 text-center">Select 4 verses</h2>
            <div className="flex flex-col items-center gap-2 max-h-[50vh] overflow-y-auto scrollbar-hide py-2 scroll">
              {lrc.map((line, index) => {
                const selected = selectedLyrics.includes(index);
                return (
                  <button
                    key={index}
                    onClick={() => handleVerseClick(index)}
                    className={cn(
                      "text-muted-foreground w-[95%] max-w-lg p-4 text-lg sm:text-xl font-medium rounded-2xl text-start italic transition-all duration-200 shadow-sm focus:outline-none",
                      selected
                        ? "bg-primary/80 text-secondary border-primary scale-105 shadow-xl ring-2 ring-primary/30"
                        : "border-border hover:bg-primary/10 hover:border-primary/40 hover:scale-[1.03]"
                    )}
                    style={{
                      boxShadow: selected ? '0 4px 24px 0 rgba(80,80,200,0.10)' : undefined,
                      cursor: 'pointer',
                    }}
                  >
                    {line}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-end mt-6 gap-2">
              <Button variant="outline" onClick={() => {
                setShowLyrics(false);
                setSelected(null);
                setLrc(null);
                setSelectedLyrics([]);
              }}>Close</Button>
              <Button
                disabled={selectedLyrics.length !== 4}
                className="font-semibold"
                onClick={() => {
                  setShowLyrics(false);
                  finalizeSelection();
                }}
              >Confirm ({selectedLyrics.length}/4)</Button>
            </div>
          </div>
        </div>
      )}

      {/* No lyrics found modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-background border border-border rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fade-in-up">
            <Button
              variant="ghost"
              className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors text-2xl font-bold"
              onClick={() => setShowModal(false)}
              aria-label="Cerrar"
            >
              <X />
            </Button>

            {modalType === 'noLyrics' && (
              <>
                <h3 className="text-xl font-semibold mb-2 text-center">No lyrics found</h3>
                <p className="text-muted-foreground mb-4 text-center">
                  No lyrics were found for this song. Would you like to continue anyway?
                </p>
              </>
            )}

            {modalType === 'instrumental' && (
              <>
                <h3 className="text-xl font-semibold mb-2 text-center">Instrumental track</h3>
                <p className="text-muted-foreground mb-4 text-center">
                  This track appears to be instrumental. There's likely no lyrics available.
                </p>
              </>
            )}

            {modalType === 'error' && (
              <>
                <h3 className="text-xl font-semibold mb-2 text-center">Lyrics fetch error</h3>
                <p className="text-muted-foreground mb-4 text-center">
                  Something went wrong while searching for the lyrics. Please try another track.
                </p>
              </>
            )}

            <div className="flex justify-around gap-4">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Choose other
              </Button>
              <Button onClick={() => {
                setShowModal(false);
                setShowLyrics(false);
              }}>
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}

      {posterImage && !posterError && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-2xl shadow-2xl p-6 w-full max-w-3xl relative animate-fade-in-up">
            <Button
              variant="ghost"
              className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors text-2xl font-bold"
              onClick={() => {
                URL.revokeObjectURL(posterImage);
                setPosterImage(null);
              }}
              aria-label="Close"
            >
              <X />
            </Button>
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Your Poster</h2>
              <p className="text-xs text-foreground">{selected!.name} - {selected!.artist}</p>
            </div>
            <div className="flex justify-center my-6">
              <img
                src={posterImage}
                alt="Generated poster"
                className="w-auto h-auto max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg"
                style={{ imageRendering: 'crisp-edges' }}
              />
            </div>
            <div className="flex justify-center gap-3">
              <Button
                variant="secondary"
                onClick={sharePost}
                className="font-semibold"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button
                asChild
                className="font-semibold"
              >
                <a
                  href={posterImage}
                  download={filename}
                >
                  Download ({formatFileSize(posterSize)})
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}

      {generating && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center animate-fade-in">
          <div className="flex flex-col items-center gap-4 p-8 bg-background/80 rounded-2xl shadow-xl border border-border">
            <Loader2 className="animate-spin text-primary" size={40} />
            <span className="text-lg font-semibold text-primary">Generating poster...</span>
          </div>
        </div>
      )}

      {posterError && !posterImage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-red-800/90 text-white px-6 py-3 rounded-xl shadow-lg animate-fade-in-up">
          {posterError}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-red-800/80 text-white text-sm px-6 py-3 rounded-xl shadow-lg font-medium animate-fade-in-up border border-red-700">
            {error}
          </div>
        </div>
      )}
    </div>
  )
}

function isTrack(thing: TrackResponse | AlbumResponse): thing is TrackResponse {
  return (thing as TrackResponse).tracks !== undefined;
}

function isAlbum(thing: TrackResponse | AlbumResponse): thing is AlbumResponse {
  return (thing as AlbumResponse).albums !== undefined;
}

function isValidImageUrl(url: string): boolean {
  const imageExtRegex = /\.(jpg|jpeg|png|webp|gif|avif|bmp|tiff)$/i;
  const trustedDomains = ['i.scdn.co', 'images.unsplash.com', 'source.unsplash.com', 'via.placeholder.com'];

  try {
    const { hostname } = new URL(url);
    if (trustedDomains.includes(hostname)) {
      return true;
    }
    return imageExtRegex.test(url);
  } catch {
    return false;
  }
};

type PosterHistoryItem = {
  id: string;
  name: string;
  size: number;
  date: number;
  payload: PosterPayload;
  coverUrl?: string | null;
};

type PosterPayload = {
  type: 'album' | 'track';
  metadata: TrackMetadata | AlbumMetadata | null;
  options: {
    palette: boolean;
    accent: boolean;
    theme: Options;
    indexing: boolean;
  }
}
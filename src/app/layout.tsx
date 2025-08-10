import type { Metadata } from "next";
import { Rubik, Monoton } from "next/font/google";
import "./globals.css";

const monoton = Monoton({
  display: 'swap',
  preload: true,
  subsets: ['latin'],
  variable: '--font-monoton',
  weight: '400'
})

const rubik = Rubik({
  display: 'swap',
  preload: true,
  subsets: ['latin'],
  variable: '--font-rubik',
  weight: ['400', '500', '600']
});

export const metadata: Metadata = {
  title: "Echoica | Lyrics Poster Generator",
  description:
    "Echoica is a modern web app to explore, visualize, and create beautiful music posters using your favorite tracks and albums. Generate lyric posters, customize themes, and share your musical art instantly.",
  keywords: [
    "music",
    "lyrics",
    "poster",
    "generator",
    "art",
    "visualizer",
    "tracks",
    "albums",
    "spotify",
    "custom",
    "share",
    "themes",
    "vintage",
    "modern",
    "echoica"
  ],
  authors: [{ name: "ChrizzzDev", url: "https://github.com/ChrizzzDev" }],
  creator: "ChrizzzDev",
  openGraph: {
    title: "Echoica | Lyrics Poster Generator",
    description:
      "Create stunning lyric posters from your favorite songs and albums. Personalize, visualize, and share your music art with Echoica.",
    url: "https://echoica.vercel.app",
    siteName: "Echoica",
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Echoica | Lyrics Poster Generator",
    description:
      "Generate and share beautiful lyric posters with Echoica. Your music, your art.",
    creator: "@ChrizzzDev"
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png"
  },
  manifest: "/manifest.json",
  category: "music",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${rubik.variable} ${monoton.variable} dark scroll
        antialiased items-center justify-center flex 
        `}
      >
        {children}
      </body>
    </html>
  );
}

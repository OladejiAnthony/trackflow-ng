import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono, Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "TrackFlow — Smart Finance for Nigerians",
    template: "%s | TrackFlow",
  },
  description:
    "Track income, expenses, budgets, and savings goals with AI-powered insights. Built for Nigerian individuals, families, and SMEs.",
  keywords: [
    "finance tracker",
    "Nigeria",
    "budget",
    "expense tracking",
    "savings",
    "Naira",
    "SME",
    "personal finance",
  ],
  authors: [{ name: "TrackFlow" }],
  creator: "TrackFlow",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://trackflow.ng"
  ),
  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: "TrackFlow",
    title: "TrackFlow — Smart Finance for Nigerians",
    description:
      "Track income, expenses, budgets, and savings goals with AI-powered insights.",
  },
  twitter: {
    card: "summary_large_image",
    title: "TrackFlow — Smart Finance for Nigerians",
    description:
      "Track income, expenses, budgets, and savings goals with AI-powered insights.",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TrackFlow",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)",  color: "#0f172a" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(inter.variable, plusJakarta.variable, jetbrainsMono.variable, "font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="antialiased min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

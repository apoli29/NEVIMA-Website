import type { Metadata, Viewport } from "next";
import { Instrument_Sans } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

/* Titles: Raleway, self-hosted from /fonts. The variable file is used so the
   headline weight is a true Medium (500) and the lighter line above it is a
   real Light (300) rather than a synthesised one. */
const title = localFont({
  src: "../../fonts/Raleway/Raleway-VariableFont_wght.ttf",
  weight: "100 900",
  style: "normal",
  variable: "--f-title",
  display: "swap",
});

/* Everything that is not a title. Open apertures and a tall x-height, which
   is what the supporting line needs at small size on a white ground. */
const read = Instrument_Sans({
  subsets: ["latin"],
  variable: "--f-read",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nevima.pt"),
  title: {
    default: "nevima — websites e identidade visual",
    template: "%s · nevima",
  },
  description:
    "Duas pessoas, ferramentas certas: websites e identidade visual ao nível de agências muito maiores, sem a burocracia que costuma vir com esse tamanho.",
  openGraph: {
    title: "nevima — menos estrutura, mais alcance",
    description:
      "Estúdio de websites e identidade visual. Duas pessoas, zero intermediários, resultados de agência grande.",
    type: "website",
    locale: "pt_PT",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-PT" className={`${title.variable} ${read.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}

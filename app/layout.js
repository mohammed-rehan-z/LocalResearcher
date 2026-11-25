import "./globals.css";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "./theme-provider";
import { Footer } from "../components/footer";
import { MotionProvider } from "./motion-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata = {
  title: "LocalResearcher - Academic Intelligence Platform",
  description: "A decentralized academic intelligence platform designed for deep literature synthesis.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${jetbrainsMono.variable} antialiased min-h-screen dark scroll-smooth`}
      suppressHydrationWarning
    >
      <body className="font-sans text-body-md min-h-screen flex flex-col relative bg-background text-foreground selection:bg-[#38bdf8] selection:text-[#050505]">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <MotionProvider>
            {children}
            <Footer />
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

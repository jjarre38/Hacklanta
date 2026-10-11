import { cookies } from "next/headers";
import { LocaleProvider, LocalizedText } from "@/lib/i18n/LocaleProvider";
import { LOCALE_COOKIE, validLocale, translate } from "@/lib/i18n/core";
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { PageBanner } from "@/components/layout/PageBanner";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export function generateMetadata(): Metadata {
  const locale = validLocale(cookies().get(LOCALE_COOKIE)?.value);
  return {
    title: {
      default: translate(locale, "HomePath — What can I still do next?"),
      template: "%s · HomePath",
    },
    description: translate(locale, "HomePath helps Metro Atlanta renters facing eviction understand their situation, find local help, and build a plan for what comes next."),
  };
}

export const viewport: Viewport = {
  themeColor: "#302044",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = validLocale(cookies().get(LOCALE_COOKIE)?.value);
  return (
    <html lang={locale}>
      <body className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col antialiased`}>
        <LocaleProvider initialLocale={locale}>
          <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">
            <LocalizedText>Skip to content</LocalizedText>
          </a>
          <Navigation />
          <main id="main" className="flex-1">
            <PageBanner />
            {children}
          </main>
          <Footer />
        </LocaleProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { DocsNavigation } from "@/components/docs-navigation";
import { SiteHeader } from "@/components/site-header";
import { inter, plusJakartaSans } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://docs.useceiba.com"),
  title: {
    default: "Ceiba Documentation",
    template: "%s | Ceiba Docs",
  },
  description:
    "Integrate Ceiba with an existing Node API using Runtime-backed access enforcement, a thin SDK, and the operator Control Plane.",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/ceiba-logo.png",
    apple: "/ceiba-logo.png",
  },
  openGraph: {
    title: "Ceiba Documentation",
    description:
      "Productize an existing Node API with API keys, policies, plans, quotas, usage tracking, and subscription-gated access.",
    url: "https://docs.useceiba.com",
    siteName: "Ceiba Docs",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakartaSans.variable}`}>
      <body>
        <SiteHeader />
        <div className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-[90rem] grid-cols-1 md:grid-cols-[16rem_minmax(0,1fr)]">
          <aside className="hidden border-r border-border bg-background px-4 py-8 md:block">
            <div className="sticky top-24">
              <DocsNavigation />
            </div>
          </aside>
          <main className="min-w-0 px-4 py-8 sm:px-7 md:px-10 md:py-12 lg:px-14">
            <div className="mx-auto w-full max-w-3xl">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}

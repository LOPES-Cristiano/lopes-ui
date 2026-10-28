import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/Toast";
import SiteHeader from "@/app/_components/SiteHeader";
import AppSidebar from "@/app/_components/AppSidebar";
import { ShellProvider } from "@/components/ShellContext";
import { ThemeProvider, ThemeScript } from "@/components/ThemeContext";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Lopes UI",
  description: "Biblioteca corporativa de componentes React, Next.js e Tailwind CSS v4",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const sidebarCollapsed = cookieStore.get("shell_sidebar_collapsed")?.value === "true";

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full w-full flex flex-col bg-background text-foreground">
        <ThemeProvider>
          <Toaster position="top-right" />
          <ShellProvider defaultCollapsed={sidebarCollapsed} defaultHasSidebar>
            <SiteHeader />
            <div className="flex flex-1 min-h-0 min-w-0">
              <div className="contents md:block md:h-[calc(100vh-4rem)] md:sticky md:top-16 md:shrink-0">
                <AppSidebar />
              </div>
              <div className="flex-1 min-w-0">
                {children}
              </div>
            </div>
          </ShellProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

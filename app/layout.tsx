import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "@/components/Toast";
import SiteHeader from "@/components/SiteHeader";
import { ShellProvider } from "@/components/ShellContext";
import { ThemeProvider } from "@/components/ThemeContext";
import { cookies } from "next/headers";
import AppSidebar from "@/components/AppSidebar";

export const metadata: Metadata = {
  title: "Lopes UI",
  description: "Espaço para testar e experimentar componentes",
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
      <head />
      <body className="min-h-full w-full flex flex-col bg-[--background]">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme')||((window.matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light');if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
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


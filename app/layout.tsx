import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/Toast";
import SiteHeader from "@/components/SiteHeader";
import { ShellProvider } from "@/components/ShellContext";
import { cookies } from "next/headers";
import AppSidebar from "@/components/AppSidebar";

export const metadata: Metadata = {
  title: "PlayGround",
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
    <html lang="pt-BR" >
      <body className="min-h-full flex flex-col">
        <Toaster position="top-right" />
        <ShellProvider defaultCollapsed={sidebarCollapsed} defaultHasSidebar>
          <SiteHeader />
          <div className="flex flex-1 min-h-0">
            <div className="contents md:block md:h-[calc(100vh-4rem)] md:sticky md:top-16 md:shrink-0">
              <AppSidebar />
            </div>
            <div className="flex-1 min-w-0">
              {children}
            </div>
          </div>
        </ShellProvider>
        </body>
    
    </html>
  );
}


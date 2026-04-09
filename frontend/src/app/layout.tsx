import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/components/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import HelpCenterOverlay from "@/components/HelpCenterOverlay";
import WelcomeTourModal from "@/components/WelcomeTourModal";
import WhatsAppWidget from "@/components/WhatsAppWidget";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "MAJIA OS | Ecosistema Corporativo",
  description: "Buzón de Autogestión para Clientes MAJIA OS.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MAJIA OS",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <body className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <AuthProvider>
            {children}
            <HelpCenterOverlay />
            <WelcomeTourModal />
            <WhatsAppWidget />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

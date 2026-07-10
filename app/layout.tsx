import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { ThemeProvider } from "@/components/ThemeProvider";

/* Runs before first paint so a persisted dark theme never flashes light.
   Reads the same "pakirko:v1" payload the storage layer owns. */
const themeInitScript = `try{var s=JSON.parse(localStorage.getItem("pakirko:v1"));if(s&&s.theme==="dark")document.documentElement.classList.add("dark")}catch(e){}`;

export const metadata: Metadata = {
  title: "Pakirko",
  description: "Popisi za pakiranje na putovanja",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Pakirko",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#fbf8f3",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hr" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <ThemeProvider>
          <ServiceWorkerRegister />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

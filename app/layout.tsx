import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegistration } from "./sw-register";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: "Padel Ledger",
  description: "Gestiona tus clases, alumnos y pagos de pádel.",
  applicationName: "Padel Ledger",
  appleWebApp: { capable: true, title: "Padel Ledger", statusBarStyle: "default" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${manrope.variable} h-full antialiased`}>
      <body className="min-h-full">
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}

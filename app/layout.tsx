import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Padel Ledger",
  description: "Gestiona tus clases, alumnos y pagos de pádel.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "El Sabor Mexicano",
  description: "Sistema de pedidos para la taquería El Sabor Mexicano.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        {/* <!-- Fathom - beautiful, simple website analytics --> */}
        <script src="https://cdn.usefathom.com/script.js" data-site="ONYOCTXK" defer></script>
        {/* <!-- / Fathom --> */}
      </head>
      <body className="bg-black text-white">
        <div className="flex flex-col h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}

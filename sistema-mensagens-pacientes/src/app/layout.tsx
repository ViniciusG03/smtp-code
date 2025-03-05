import "@/app/globals.css";

export const metadata = {
  title: "Sistema de Mensagens para Pacientes",
  description: "Sistema para envio de mensagens para pacientes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}

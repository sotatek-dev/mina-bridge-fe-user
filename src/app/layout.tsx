import type { Metadata } from 'next';
import WrapperLayout from '@/components/layouts/wrapper-layout';
import ClientProviders from '@/components/providers/ClientProviders';

export const metadata: Metadata = {
  title: 'Mina Bridge',
  description: 'Mina Bridge',
  icons: '/assets/logos/logo.mina.circle.svg',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={'en'}>
      <body>
        <ClientProviders>
          <WrapperLayout>{children}</WrapperLayout>
        </ClientProviders>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { cookies } from 'next/headers';

import WrapperLayout from '@/components/layouts/wrapper-layout';
import ClientProviders from '@/components/providers/ClientProviders';
import ReduxProvider from '@/components/providers/ReduxProvider';
import { Theme } from '@/configs/constants';

import './global.css';

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
  const cookieStore = cookies();
  const theme = cookieStore.get('theme')?.value || Theme.LIGHT;

  return (
    <html lang={'en'} data-theme={theme}>
      <body>
        <ReduxProvider>
          <ClientProviders>
            <WrapperLayout>{children}</WrapperLayout>
          </ClientProviders>
        </ReduxProvider>
      </body>
    </html>
  );
}

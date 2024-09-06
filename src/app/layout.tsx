import type { Metadata } from 'next';
import WrapperLayout from '@/components/layouts/wrapper-layout';
import ClientProviders from '@/components/providers/ClientProviders';
import Cookie from 'cookiejs';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ROUTES from '@/configs/routes';

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
  // const cookieStore = cookies();
  // const isConnected = cookieStore.get('address');

  // if (!isConnected  ) {
  //   redirect(ROUTES
  //     .HOME
  //   );
  // }

  // console.log({ isConnected });

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

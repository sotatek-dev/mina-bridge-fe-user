import ROUTES from '@/configs/routes';
import { Stack } from '@chakra-ui/react';
import Link from 'next/link';
// import { Link } from "@chakra-ui/next-js";

export default function Home() {
  return (
    <main
      className={'flex min-h-screen flex-col items-center justify-between p-24'}
    >
      <Stack>
        <Link href={ROUTES.USER_GUIDE}>User Guild</Link>
      </Stack>
    </main>
  );
}

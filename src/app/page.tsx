import React from "react";
import Link from "next/link";
import ROUTES from "@/configs/routes";
import { Stack } from "@chakra-ui/layout";

export default function Home() {
  return (
    <main className={''}>
      <Stack>
        <Link href={ROUTES.USER_GUIDE}>User Guild</Link>
      </Stack>
    </main>
  );
}

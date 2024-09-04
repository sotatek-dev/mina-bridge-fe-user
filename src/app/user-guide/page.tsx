'use client';
import { Box, Heading, VStack } from '@chakra-ui/react';
import Introduction from '@/markdown/introduction.mdx';
import UserGuideContent from '@/markdown/user_guide.mdx';

export type SectionType = {
  key: number;
  title: string;
  type: string;
};

export default function UserGuide() {
  return (
    <VStack alignItems={"flex-start"} mb={"40px"}>
      <Box>
        <Heading
          as={"h2"}
          variant={"h1"}
          fontSize={{ base: '32px', md: '40px' }}
          mb={"30px"}
          mt={"40px"}
        >
          Introduction
        </Heading>
        <Introduction />
      </Box>
      <Box>
        <Heading
          as={"h2"}
          variant={"h1"}
          fontSize={{ base: '32px', md: '40px' }}
          mb={"30px"}
          mt={"40px"}
        >
          Guideline For Users
        </Heading>
        <UserGuideContent />
      </Box>
    </VStack>
  );
}

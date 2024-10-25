'use client';
import { Box, Heading, Table, Text, VStack } from '@chakra-ui/react';

import { useHistoryState } from './context';
import useHistoryLogic from './hooks/useHistoryLogic';
import EmptyHistoryData from './partials/empty.historyData';
import BodyTable from './partials/table.body';
import HeaderTable from './partials/table.header';
import Pagination from './partials/table.pagination';

import { Theme } from '@/configs/constants';
import useChakraTheme from '@/hooks/useChakraTheme';
import { getWalletSlice, useAppSelector } from '@/store';

function HistoryContent() {
  const { address } = useAppSelector(getWalletSlice);
  const { state } = useHistoryState();
  useHistoryLogic();
  const { colorMode } = useChakraTheme();

  return (
    <VStack
      gap={'0'}
      w={'full'}
      alignItems={'flex-start'}
      padding={{ base: ' 40px 0 ', md: '40px 54px' }}
    >
      <Heading as={'h1'} variant={'h1'} mb={'12px'} color={'text.900'}>
        History
      </Heading>
      {address && (
        <Text
          variant={'lg'}
          color={colorMode === Theme.DARK ? 'text.400' : 'text.500'}
          mb={'25px'}
          w={'full'}
        >
          {address}
        </Text>
      )}
      <Text variant={'xl_semiBold'} color={'text.900'}>
        Order History
      </Text>
      <VStack w={'full'} bg={'background.modal'} pb={'33px'} mt={'12px'}>
        <Box
          width={'full'}
          overflowY={'hidden'}
          overflowX={state.data.length > 0 ? 'auto' : 'hidden'}
        >
          <Table minW={'1140px'}>
            <HeaderTable />
            {state.data.length > 0 && <BodyTable data={state.data} />}
          </Table>
        </Box>
        {state.data.length > 0 ? <Pagination /> : <EmptyHistoryData />}
      </VStack>
    </VStack>
  );
}

export default HistoryContent;

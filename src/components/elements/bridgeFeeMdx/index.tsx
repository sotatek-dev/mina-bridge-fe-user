/* eslint-disable react/no-unescaped-entities */
import { Box, Table, Tbody, Td, Text, Th, Thead, Tr } from '@chakra-ui/react';
import { useMemo } from 'react';

import useWindowSize from '@/hooks/useWindowSize';

const TableEthToMinaRows = [
  {
    label: 'ETH Lock \nCharge for lock transaction\'s gas fee',
    amount: 'Variable (ETH)',
    calculation: 'Eth network gas fee',
  },
  {
    label: 'Bridge Fee \nBridge operators fee',
    amount: '0.00%',
    calculation: 'By Bridge Operator',
  },
  {
    label: 'Mina Mint \nCharge to cover minting transaction’s gas fee.',
    amount: '0.000001 ETH',
    calculation: 'Fixed fee can be updated by Bridge Operator depending on network cost',
  },
];
const TableEthToMinaFeeSource = [
  'Eth Account (Metamask) - Taken from transaction total on Metamask when txn confirmed.',
  'Eth Account (Metamask) - Taken from transaction total on Metamask when txn confirmed.',
];
const TableMinaToEthRows = [
  {
    label: 'Mina Burn \nCharge for burn transaction on Mina',
    amount: 'Variable (Mina)',
    calculation: 'Mina Network fee',
  },
  {
    label: 'Bridge Fee \nBridge operators fee',
    amount: '0.00%',
    calculation: 'By Bridge Operator',
  },
  {
    label: 'Eth Unlock \nCharge for unlock ETH transaction’s gas fee.',
    amount: '0.00001',
    calculation: 'Fixed fee - currently 0.00001 ETH',
  },
];

const TableMinaToEthFeeSource = [
  "Auro wallet - Taken from user's Wallet on txn confirm.",
  'Taken from transaction total (ETH amount unlocked).',
];

type TableProps = {
  title: string;
  rows: { label: string; amount: string; calculation: string }[];
  feeSource: string[];
};

const BridgeTable = ({ title, rows, feeSource }: TableProps) => (
  <Table variant={'simple'}>
    <Thead>
      <Tr>
        <Th
          border={'1px solid'}
          borderColor={'text.300'}
          color={'text.900'}
          fontSize={14}
          textTransform={'unset'}
          w={'10%'}
        >
          {title}
        </Th>
        <Th
          border={'1px solid'}
          borderColor={'text.300'}
          color={'text.900'}
          fontSize={14}
          textTransform={'unset'}
          w={'15%'}
        >
          Amount
        </Th>
        <Th
          border={'1px solid'}
          borderColor={'text.300'}
          color={'text.900'}
          fontSize={14}
          textTransform={'unset'}
          w={'20%'}
        >
          How is it calculated
        </Th>
        <Th
          border={'1px solid'}
          borderColor={'text.300'}
          color={'text.900'}
          fontSize={14}
          textTransform={'unset'}
          w={'55%'}
        >
          Fee source
        </Th>
      </Tr>
    </Thead>
    <Tbody>
      {rows.map((row, index) => (
        <Tr key={index}>
          <Td
            border={'1px solid'}
            borderColor={'text.300'}
            color={'text.900'}
            fontWeight={700}
          >
            {row.label}
          </Td>
          <Td border={'1px solid'} borderColor={'text.300'} color={'text.700'}>
            {row.amount}
          </Td>
          <Td border={'1px solid'} borderColor={'text.300'} color={'text.700'}>
            {row.calculation}
          </Td>
          {index === 0 && (
            <Td
              border={'1px solid'}
              borderColor={'text.300'}
              color={'text.700'}
            >
              {feeSource[0].split('\n').map((line, idx) => (
                <Text key={idx} mb={1}>
                  {line}
                  <br />
                </Text>
              ))}
            </Td>
          )}
          {index === 1 && (
            <Td
              rowSpan={2}
              border={'1px solid'}
              borderColor={'text.300'}
              color={'text.700'}
            >
              {feeSource[1].split('\n').map((line, idx) => (
                <Text key={idx} mb={1}>
                  {line}
                  <br />
                </Text>
              ))}
            </Td>
          )}
        </Tr>
      ))}
    </Tbody>
  </Table>
);

const BridgeFee = () => {
  const { width } = useWindowSize();
  const WIDTH = useMemo(() => {
    if (width < 400) return '300px';
    if (width < 500) return '350px';
    return '100%';
  }, [width]);
  return (
    <Box my={5} w={WIDTH} overflowX={'auto'}>
      <BridgeTable
        title={'ETH > Mina'}
        rows={TableEthToMinaRows}
        feeSource={TableEthToMinaFeeSource}
      />
      <Box w={'100%'} h={'1px'} color={'text.25'} my={5} />
      <BridgeTable
        title={'Mina > ETH'}
        rows={TableMinaToEthRows}
        feeSource={TableMinaToEthFeeSource}
      />
    </Box>
  );
};

export default BridgeFee;

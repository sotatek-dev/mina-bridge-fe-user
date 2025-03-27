'use client';
import { Text, Th, Thead, Tr } from '@chakra-ui/react';
import React from 'react';

const header = [
  'Status',
  'Amount/From (Network)',
  'Amount Received/To (Network)',
  'Bridging Fee',
  'Gas Fee',
  'Create Time',
  'Confirmed time',
  'Order ID',
];

function HeaderTable() {
  return (
    <Thead>
      <Tr>
        {header.map((item: string, index: number) => {
          return (
            <Th key={index} borderBottom={'solid 1px'} borderColor={'text.300'}>
              <Text
                textTransform={'capitalize'}
                variant={'md_bold'}
                color={'text.900'}
              >
                {item}
              </Text>
            </Th>
          );
        })}
      </Tr>
    </Thead>
  );
}

export default React.memo(HeaderTable);

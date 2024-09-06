'use client';
import { VStack } from '@chakra-ui/react';
import React from 'react';

import { useModalSTState } from '../context';

import DisplayAsset from './displayAsset';
import EmptyData from './emptyData';

type Props = {};

export default function ListAssets({}: Props) {
  const { listTokenDisplay } = useModalSTState().state;

  return (
    <VStack mt={'22px'}>
      {listTokenDisplay.length > 0 ? (
        listTokenDisplay.map((item, index) => (
          <DisplayAsset
            key={`${item.symbol}_${item.tokenAddr}_${index}`}
            data={item}
          />
        ))
      ) : (
        <EmptyData />
      )}
    </VStack>
  );
}

'use client';
import { Grid, GridItem, HStack, Heading, Image } from '@chakra-ui/react';
import { useMemo } from 'react';

import DisplayBalance from './displayBalance';

import NETWORKS from '@/models/network';
import { PairType, TokenType } from '@/store/slices/persistSlice';

type Props = {
  assetSymbol: string;
  data: PairType & { children: TokenType[] };
};

export default function DisplayAsset({ assetSymbol, data }: Props) {
  function prioritizeNativeToken(data: Props['data']) {
    let fArr: TokenType[] = [];
    let sArr: TokenType[] = [];
    data.children.forEach((asset) => {
      const isNative =
        Object.values(NETWORKS).filter(
          (nw) => nw.nativeCurrency.symbol === asset.symbol
        ).length > 0;
      if (isNative) fArr[0] = asset;
      if (!isNative) sArr.push(asset);
    });
    return fArr.concat(sArr);
  }

  const assets = useMemo(() => prioritizeNativeToken(data), [data]);

  return (
    <Grid
      templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }}
      gap={'0'}
      w={'full'}
      bg={'background.modal'}
      px={'35px'}
      py={'26px'}
    >
      <GridItem mb={{ base: '30px', md: '0' }}>
        <HStack>
          <Image src={'/assets/logos/logo.ethereum.circle.svg'} h={'40px'} />
          <Heading as={'h4'} variant={'h4'} color={'text.900'}>
            {assetSymbol}
          </Heading>
        </HStack>
      </GridItem>
      <GridItem>
        {assets.map((asset, index) => (
          <DisplayBalance
            key={`${asset.pairId}_${asset.symbol}_${index}`}
            asset={asset}
            network={NETWORKS[asset.network]}
            isLastItem={index === assets.length - 1}
          />
        ))}
      </GridItem>
    </Grid>
  );
}

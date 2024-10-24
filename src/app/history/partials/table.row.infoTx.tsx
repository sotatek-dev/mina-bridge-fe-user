'use client';
import { Link, Text } from '@chakra-ui/react';
import _ from 'lodash';
import React from 'react';

import {
  fromWei,
  getDecimal,
  truncatedNumber,
  truncateMid,
} from '@/helpers/common';

type InfoTransactionProps = {
  amount: string;
  tokenName: string;
  txHash: string | null;
  networkName: string;
  scanUrl?: string;
};

function InfoTransaction({
  amount,
  tokenName,
  txHash,
  networkName,
  scanUrl,
}: InfoTransactionProps) {
  const [fSlice, sSlice] = !txHash ? ['', ''] : truncateMid(txHash, 4, 4);
  const value = amount ? fromWei(amount, getDecimal(networkName)) : '0.00';
  return (
    <>
      <Text variant={'lg'} color={'text.900'}>
        {`${truncatedNumber(value, 0.0001)} ${_.isEmpty(tokenName) ? '' : tokenName}`}
      </Text>

      {txHash && scanUrl && (
        <Link href={`${scanUrl}/tx/${txHash}`} target={'_blank'}>
          <Text variant={'md'} color={'primary.purple'} whiteSpace={'nowrap'}>
            {`${fSlice}...${sSlice} (${networkName.toUpperCase()})`}
          </Text>
        </Link>
      )}
    </>
  );
}

export default InfoTransaction;

'use client';
import { Tbody, Td, Text, Tr } from '@chakra-ui/react';
import _ from 'lodash';
import React from 'react';

import InfoTransaction from './table.row.infoTx';
import RowStatus from './table.row.status';

import {
  formWei,
  formatDateAndTime,
  getDecimal,
  truncatedNumber,
} from '@/helpers/common';
import { HistoryResponse } from '@/services/usersService';
import { getWalletInstanceSlice, useAppSelector } from '@/store';

type PropsBodyTable = {
  data: HistoryResponse[];
};

function BodyTable({ data }: PropsBodyTable) {
  const { networkInstance } = useAppSelector(getWalletInstanceSlice);
  return (
    <Tbody>
      {data.map((item) => {
        return (
          <Tr key={item.id}>
            <Td borderBottom={'solid 1px #E4E4E7'}>
              <RowStatus status={item.status} networkName={item.networkFrom} />
            </Td>
            <Td borderBottom={'solid 1px #E4E4E7'}>
              <InfoTransaction
                amount={item.amountFrom}
                tokenName={item.tokenFromName}
                txHash={item.txHashLock}
                networkName={item.networkFrom}
                scanUrl={networkInstance.src?.metadata.scanUrl}
              />
            </Td>
            <Td borderBottom={'solid 1px #E4E4E7'}>
              <InfoTransaction
                amount={item.amountReceived!!}
                tokenName={item.tokenReceivedName!!}
                txHash={item.txHashUnlock}
                networkName={item.networkReceived}
                scanUrl={networkInstance.tar?.metadata.scanUrl}
              />
            </Td>
            <Td borderBottom={'solid 1px #E4E4E7'}>
              <Text variant={'lg'} color={'text.900'}>
                {`${truncatedNumber(
                  item.protocolFee
                    ? formWei(
                        item.protocolFee,
                        getDecimal(item.networkReceived)
                      )
                    : '0.00'
                )} ${_.isEmpty(item.tokenReceivedName) ? '' : item.tokenReceivedName}`}
              </Text>
              <Text variant={'md'} color={'text.500'}>
                {formatDateAndTime(item.blockTimeLock)}
              </Text>
            </Td>
            <Td borderBottom={'solid 1px #E4E4E7'}>
              <Text variant={'lg'} color={'text.900'}>
                {item.id}
              </Text>
            </Td>
          </Tr>
        );
      })}
    </Tbody>
  );
}

export default BodyTable;

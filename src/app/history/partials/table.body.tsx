'use client';
import { Box, Tbody, Td, Text, Tr } from '@chakra-ui/react';
import _ from 'lodash';
import React from 'react';

import AddressInfo from './table.row.address';
import InfoTransaction from './table.row.infoTx';
import RowStatus, { STATUS } from './table.row.status';

import {
  formatDate,
  formatTime,
  getScanUrl,
  truncatedNumber,
} from '@/helpers/common';
import { HistoryResponse } from '@/services/usersService';

type PropsBodyTable = {
  data: HistoryResponse[];
};

function BodyTable({ data }: PropsBodyTable) {
  return (
    <Tbody>
      {data.map((item) => {
        return (
          <Tr key={item.id}>
            <Td
              borderBottom={'solid 1px'}
              borderColor={'text.200'}
              position={'relative'}
            >
              <Box
                h={1}
                w={6}
                bg={'background.modal'}
                position={'absolute'}
                left={0}
                bottom={'-2px'}
              />
              <RowStatus status={item.status} networkName={item.networkFrom} />
            </Td>
            <Td borderBottom={'solid 1px'} borderColor={'text.200'}>
              <InfoTransaction
                amount={item.amountFrom}
                tokenName={item.tokenFromName}
                txHash={item.txHashLock}
                networkName={item.networkFrom}
                scanUrl={getScanUrl(item.networkFrom)}
              />
            </Td>
            <Td borderBottom={'solid 1px'} borderColor={'text.200'}>
              <InfoTransaction
                amount={item.amountReceived!!}
                tokenName={item.tokenReceivedName!!}
                txHash={item.txHashUnlock}
                networkName={item.networkReceived}
                scanUrl={getScanUrl(item.networkReceived)}
              />
            </Td>
            <Td borderBottom={'solid 1px'} borderColor={'text.200'}>
              <AddressInfo address={item.senderAddress} />
            </Td>
            <Td borderBottom={'solid 1px'} borderColor={'text.200'}>
              <AddressInfo address={item.receiveAddress} />
            </Td>
            <Td borderBottom={'solid 1px'} borderColor={'text.200'}>
              <Text variant={'lg'} color={'text.900'} whiteSpace={'nowrap'}>
                {`${truncatedNumber(
                  Number(item.tip) ? item.tip : '0',
                )} ${!item.tip || _.isEmpty(item.tokenFromName) ? '' : item.tokenFromName}`}
              </Text>
            </Td>
            <Td borderBottom={'solid 1px'} borderColor={'text.200'}>
              <Text variant={'lg'} color={'text.900'} whiteSpace={'nowrap'}>
                {`${truncatedNumber(
                  item.gasFee ? item.gasFee : '0.00',
                )} ${!item.gasFee || _.isEmpty(item.tokenFromName) ? '' : item.tokenFromName}`}
              </Text>
            </Td>
            <Td borderBottom={'solid 1px'} borderColor={'text.200'}>
              <Text variant={'lg'} color={'text.900'} whiteSpace={'nowrap'}>
                {formatDate(Number(item.blockTimeLock) * 1000)}
              </Text>
              <Text variant={'lg'} color={'text.900'} whiteSpace={'nowrap'}>
                {formatTime(Number(item.blockTimeLock) * 1000)}
              </Text>
            </Td>
            <Td borderBottom={'solid 1px'} borderColor={'text.200'}>
              {item?.status === STATUS.COMPLETED && item?.updatedAt && (
                <>
                  <Text variant={'lg'} color={'text.900'} whiteSpace={'nowrap'}>
                    {formatDate(item?.updatedAt)}
                  </Text>
                  <Text variant={'lg'} color={'text.900'} whiteSpace={'nowrap'}>
                    {formatTime(item?.updatedAt)}
                  </Text>
                </>
              )}
            </Td>
            <Td
              borderBottom={'solid 1px'}
              borderColor={'text.200'}
              position={'relative'}
            >
              <Box
                h={1}
                w={6}
                bg={'background.modal'}
                position={'absolute'}
                right={0}
                bottom={'-2px'}
              />
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

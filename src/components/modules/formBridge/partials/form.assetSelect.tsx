'use client';
import { Button, ButtonProps, Image, Text, VStack } from '@chakra-ui/react';
import React, { useMemo } from 'react';

import { useFormBridgeState } from '../context';

import { MODAL_NAME } from '@/configs/modal';
import { NETWORK_TYPE } from '@/models/network/network';
import { WALLET_NAME } from '@/models/wallet';
import {
  getPersistSlice,
  getWalletInstanceSlice,
  getWalletSlice,
  useAppDispatch,
  useAppSelector,
} from '@/store';
import { uiSliceActions } from '@/store/slices/uiSlice';

type Props = { buttonProps?: ButtonProps } & Pick<
  ButtonProps,
  ChakraBoxSizeProps
>;

function FormAssetSelector({ buttonProps, ...sizingProps }: Props) {
  const dispatch = useAppDispatch();
  const { walletKey, isConnected } = useAppSelector(getWalletSlice);
  const { networkInstance, walletInstance } = useAppSelector(
    getWalletInstanceSlice
  );
  const { listIcon } = useAppSelector(getPersistSlice);

  const { status, asset } = useFormBridgeState().state;
  const { isNativeCurrency } = useFormBridgeState().constants;

  const isEnableAddToken = useMemo(
    () =>
      walletKey === WALLET_NAME.METAMASK &&
      networkInstance.src?.type === NETWORK_TYPE.EVM &&
      !isNativeCurrency &&
      asset,
    [walletKey, networkInstance, isNativeCurrency, asset]
  );

  const assetIcon = useMemo(
    () => listIcon.find((item) => item.symbol === asset?.symbol),
    [listIcon, asset]
  );

  function openSelectAssetsModal() {
    if (status.isLoading) return;
    dispatch(uiSliceActions.openModal({ modalName: MODAL_NAME.SELECT_TOKEN }));
  }

  function watchTokenWithMetamask() {
    if (walletKey !== WALLET_NAME.METAMASK) return;
    if ('watchToken' in walletInstance!!) {
      walletInstance.watchToken({
        type: 'ERC20',
        options: {
          address: '0x08394e7e653472694ECd4527656B2881e5701A14',
          symbol: 'DOP_USDT',
          decimals: 6,
        },
      });
    }
  }

  return (
    <VStack w={'full'} align={'flex-start'} gap={'4px'} {...sizingProps}>
      <Text variant={'lg_medium'} m={'0'}>
        Asset
      </Text>
      <Button
        {...buttonProps}
        isDisabled={!isConnected}
        variant={'input'}
        w={'full'}
        px={'12px'}
        py={'12px'}
        position={'relative'}
        justifyContent={'flex-start'}
        gap={'0'}
        onClick={openSelectAssetsModal}
        leftIcon={<Image h={'24px'} src={assetIcon?.icon || ''} />}
        rightIcon={
          <Image
            w={'22px'}
            h={'22px'}
            position={'absolute'}
            right={'12px'}
            top={'50%'}
            transform={'translateY(-50%)'}
            src={'/assets/icons/icon.arrow.down.purple.svg'}
          />
        }
      >
        {asset?.symbol.toUpperCase() || ''}
      </Button>
      {isEnableAddToken && (
        <Button
          variant={'_blank'}
          onClick={watchTokenWithMetamask}
          leftIcon={
            <Image
              w={'24px'}
              h={'24px'}
              src={'/assets/icons/icon.add.circle.purple.svg'}
            />
          }
          gap={'6px'}
          mt={'4px'}
          alignItems={'center'}
          sx={{
            '.chakra-button__icon': {
              m: 0,
            },
          }}
        >
          <Text
            as={'span'}
            variant={'md_semiBold'}
            color={'primary.purple'}
            lineHeight={1}
            pt={'2px'}
          >
            Add token to Metamask
          </Text>
        </Button>
      )}
    </VStack>
  );
}
export default React.memo(FormAssetSelector);

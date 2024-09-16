'use client';
import {
  Input,
  InputGroup,
  StackProps,
  Text,
  useToast,
  VStack,
} from '@chakra-ui/react';
import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import Web3 from 'web3';

import { useFormBridgeState } from '../context';

import ITV from '@/configs/time';
import { handleException } from '@/helpers/asyncHandlers';
import { NETWORK_NAME } from '@/models/network';
import { NETWORK_TYPE } from '@/models/network/network';
import WALLETS, { Wallet } from '@/models/wallet';
import {
  getWalletInstanceSlice,
  getWalletSlice,
  useAppSelector,
} from '@/store';

export type DesAddrRef = null | { resetValue: () => void };

type Props = { isDisplayed: boolean } & Pick<StackProps, ChakraBoxSizeProps>;

const WarningList = {};

const DesAddrContent = forwardRef<DesAddrRef, Omit<Props, 'isDisplayed'>>(
  ({ ...props }, ref) => {
    type ErrorType = keyof typeof ErrorList | null;
    type WarningType = keyof typeof WarningList | null;
    const toast = useToast();
    const { updateDesAddr } = useFormBridgeState().methods;
    const { status } = useFormBridgeState().state;
    const [value, setValue] = useState<string>('');
    const { networkName } = useAppSelector(getWalletSlice);
    const { networkInstance } = useAppSelector(getWalletInstanceSlice);

    // const [tarWallet, setTarWallet] = useState<Wallet | null>(null);
    const [error, setError] = useState<ErrorType>(null);

    const throttleInput = useRef<any>(null);

    const ErrorList = useMemo(
      () => ({
        required: 'This field is required',
        // not_address: `Invalid ${networkName.tar} network address`,
        not_address: `Invalid address`,
      }),
      [networkName.tar]
    );

    function getSupportedWallet(nwkKey: NETWORK_NAME | null): Wallet | null {
      if (!nwkKey) return null;
      return (
        Object.values(WALLETS).find((wallet) =>
          wallet?.metadata?.supportedNetwork?.includes(nwkKey)
        ) || null
      );
    }

    function dpError(e: ErrorType) {
      setError(e);
      updateDesAddr('');
    }

    function throttleActions(value: string) {
      if (throttleInput.current) {
        clearTimeout(throttleInput.current);
        throttleInput.current = null;
      }
      throttleInput.current = setTimeout(async () => {
        if (value.length < 1) return dpError('required');
        switch (networkInstance.tar?.type) {
          case NETWORK_TYPE.EVM:
            const [emitVal, evmError] = handleException(
              value,
              Web3.utils.toChecksumAddress
            );
            if (evmError) return dpError('not_address');
            setError(null);
            setValue(emitVal!!);
            updateDesAddr(emitVal!!);
            break;
          case NETWORK_TYPE.ZK:
            // TODO: build faild N is not function
            const { PublicKey } = await import('o1js');
            const [_, zkError] = handleException(value, PublicKey.fromBase58);
            console.log({ zkError });

            if (zkError) return dpError('not_address');
            setError(null);
            updateDesAddr(value);
            break;
          default:
            break;
        }
      }, ITV.MS5);
    }

    function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
      const current = e.currentTarget.value;
      throttleActions(current + e.clipboardData.getData('Text'));
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
      if (status.isLoading) {
        e.preventDefault();
        return;
      }
      if (throttleInput.current) {
        clearTimeout(throttleInput.current);
        throttleInput.current = null;
      }
    }

    function handleKeyUp(e: React.KeyboardEvent<HTMLInputElement>) {
      if (status.isLoading) {
        e.preventDefault();
        return;
      }
      throttleActions(e.currentTarget.value);
    }

    function handleChangeValue(e: React.ChangeEvent<HTMLInputElement>) {
      if (status.isLoading) {
        e.preventDefault();
        return;
      }
      if (e.currentTarget.value.length < 1) updateDesAddr('');
      setValue(e.currentTarget.value);
    }

    // useEffect(() => {
    //   setTarWallet(getSupportedWallet(networkName.tar));
    // }, [networkName.tar]);

    useImperativeHandle(
      ref,
      () => ({
        resetValue: () => {
          setValue('');
          setError(null);
        },
      }),
      [setValue, setError]
    );

    return (
      <VStack w={'full'} align={'flex-start'} gap={'4px'} {...props}>
        <Text variant={'lg_medium'} m={'0'}>
          Destination
        </Text>
        <InputGroup>
          {/* <InputLeftElement h="48px" pl="12px">
            <Image h="24px" src={tarWallet?.metadata.logo.base} />
          </InputLeftElement> */}
          <Input
            size={'md_medium'}
            // pl="44px"
            pl={'12px'}
            value={value}
            onChange={handleChangeValue}
            onKeyUp={handleKeyUp}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            overflow={'auto'}
          />
        </InputGroup>
        {error && (
          <Text variant={'md'} color={'red.500'}>
            {ErrorList[error]}
          </Text>
        )}
        <Text variant={'md'} color={'text.500'}>
          This is the arrival network address
        </Text>
      </VStack>
    );
  }
);

const FormDesAddress = ({ isDisplayed, ...props }: Props) => {
  const { desAddrRef } = useFormBridgeState().constants;

  // return isDisplayed ? <DesAddrContent ref={desAddrRef} {...props} /> : null;
  return <DesAddrContent ref={desAddrRef} {...props} />;
};

export default FormDesAddress;

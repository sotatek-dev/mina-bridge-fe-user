import React from 'react';
import {
  AspectRatio,
  Box,
  Flex,
  HStack,
  Image,
  Text,
  VStack,
} from '@chakra-ui/react';
import NETWORKS from '@/models/network';
import { NETWORK_KEY } from '@/store/slices/walletSlice';
import {
  getWalletInstanceSlice,
  getWalletSlice,
  useAppDispatch,
  useAppSelector,
} from '@/store';
import { uiSliceActions } from '@/store/slices/uiSlice';
import { MODAL_NAME } from '@/configs/modal';
import { useFormBridgeState } from '../context';

type Props = { label: string; networkKey: NETWORK_KEY };

export default function NetworkCard({ label, networkKey }: Props) {
  const dispatch = useAppDispatch();

  const { status, srcNetwork, tarNetwork } = useFormBridgeState().state;

  const curNetworkInstance =
    networkKey === NETWORK_KEY.SRC ? srcNetwork : tarNetwork;
  const isEnable = !!curNetworkInstance && status.isConnected;
  function handleClick() {
    if (status.isLoading || !status.isConnected) return;
    dispatch(
      uiSliceActions.openModal({
        modalName: MODAL_NAME.SELECT_NETWORK,
        payload: {
          networkKey,
          isValidate: networkKey === NETWORK_KEY.SRC ? true : false,
        },
      })
    );
  }

  return (
    <Flex
      w={"full"}
      position={"relative"}
      justifyContent={"center"}
      alignItems={"center"}
      overflow={"hidden"}
      borderRadius={"15px"}
      px={"1px"}
      py={"1px"}
      cursor={status.isConnected ? 'pointer' : 'default'}
      _after={{
        content: '""',
        display: 'block',
        zIndex: 1,
        position: 'absolute',
        w: '500px',
        h: '500px',
        bgImage: isEnable
          ? 'linear-gradient(270deg, #DE622E 0%, #8271F0 100%)'
          : '',
        bgColor: 'text.200',
      }}
      _hover={{
        _after: {
          base: {},
          md: {
            animation: isEnable ? 'rotate linear 5s infinite' : '',
          },
        },
      }}
      onClick={handleClick}
    >
      <VStack
        w={"full"}
        h={"full"}
        px={"24px"}
        py={"19px"}
        borderRadius={"14px"}
        alignItems={"flex-start"}
        userSelect={"none"}
        bgColor={"white"}
        zIndex={2}
      >
        <Text variant={"xl_medium"} color={"text.700"}>
          {label}
        </Text>
        <HStack w={"full"} justifyContent={"flex-start"}>
          {isEnable ? (
            <>
              <Image
                h={"33px"}
                src={curNetworkInstance.metadata.logo.base}
                alt={"network icon"}
              />
              <Text
                variant={"xl_medium"}
                color={"text.900"}
                textTransform={"capitalize"}
              >
                {curNetworkInstance.name} Network
              </Text>
            </>
          ) : (
            <Text variant={"xl_medium"} color={"text.400"}>
              Select Network
            </Text>
          )}
          <Image
            ml={"auto"}
            w={"22px"}
            h={"22px"}
            src={"/assets/icons/icon.arrow.down.purple.svg"}
          />
        </HStack>
      </VStack>
    </Flex>
  );
}

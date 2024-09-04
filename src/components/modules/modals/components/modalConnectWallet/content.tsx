import React from 'react';
import { Checkbox, Flex, HStack, Link } from '@chakra-ui/react';
import Section from './partials/section';
import useModalCWLogic from './hooks/useModalCWLogic';
import LoadingWithText from '@/components/elements/loading/spinner.text';
import { NETWORK_NAME } from '@/models/network';
import { WALLET_NAME } from '@/models/wallet';

type Props = {};

export default function ModalCWContent({}: Props) {
  const { networkOptionsRendered, walletOptionsRendered, methods } =
    useModalCWLogic();
  const { status, isAcceptTerm, selectedNetwork, selectedWallet } =
    useModalCWLogic().state;

  // const isWalletUsingSnap =
  //   selectedNetwork === NETWORK_NAME.MINA &&
  //   selectedWallet === WALLET_NAME.METAMASK;

  return status.isScreenLoading || status.isSnapInstalling ? (
    <LoadingWithText
      id={"modal-cn-wallet-screen-loading"}
      label={"Waiting for confirmation"}
      desc={""}
      w={"full"}
      h={"395px"}
      spinnerSize={100}
      bgOpacity={0}
    />
  ) : (
    <>
      <Section title={"1. Accept"}>
        <Checkbox
          className={"checkbox"}
          fontSize={"14px"}
          isChecked={isAcceptTerm}
          onChange={methods.onToggleAcceptTerm}
          alignItems={"flex-start"}
        >
          I read and accept{' '}
          <Link href={"#"} target={"_blank"} color={"primary.purple"}>
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href={"#"} target={"_blank"} color={"primary.purple"}>
            Privacy Policy
          </Link>
        </Checkbox>
      </Section>
      <Section title={"2. Choose network"} mt={"20px"}>
        <Flex h={"120px"} w={"100%"} overflowX={"auto"}>
          <HStack>{networkOptionsRendered}</HStack>
        </Flex>
      </Section>

      <Section title={"3. Choose wallet"} mb={"5px"} mt={"20px"}>
        <Flex h={"120px"} w={"100%"} overflowX={"auto"}>
          <HStack>{walletOptionsRendered}</HStack>
        </Flex>
      </Section>
    </>
  );
}

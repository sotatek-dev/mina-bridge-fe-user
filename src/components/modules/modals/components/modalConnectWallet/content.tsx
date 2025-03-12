'use client';
import { Box, Button, Checkbox, Flex, HStack, Link } from '@chakra-ui/react';
import React from 'react';

import useModalCWLogic from './hooks/useModalCWLogic';
import Section from './partials/section';

import LoadingWithText from '@/components/elements/loading/spinner.text';
import ROUTES from '@/configs/routes';
import { getWalletSlice, useAppSelector } from '@/store';

type Props = {};

export default function ModalCWContent({}: Props) {
  const { networkOptionsRendered, connectBtnProps, methods } =
    useModalCWLogic();
  const { status, isAcceptTerm } = useModalCWLogic().state;
  const { isConnected } = useAppSelector(getWalletSlice);

  return status.isScreenLoading || status.isSnapInstalling ? (
    <LoadingWithText
      id={'modal-cn-wallet-screen-loading'}
      label={'Waiting for confirmation'}
      desc={''}
      w={'full'}
      h={'395px'}
      spinnerSize={100}
      bgOpacity={0}
    />
  ) : (
    <>
      <Section title={'1. Accept'}>
        <Checkbox
          disabled={isConnected}
          className={'checkbox'}
          fontSize={'14px'}
          isChecked={isAcceptTerm}
          onChange={methods.onToggleAcceptTerm}
          alignItems={'flex-start'}
          sx={{ span: { opacity: '1 !important', cursor: 'default' } }}
        >
          I read and accept{' '}
          <Link
            href={ROUTES.TERMS_OF_SERVICE}
            target={'_blank'}
            color={'primary.purple'}
          >
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link
            href={ROUTES.PRIVACY_POLICY}
            target={'_blank'}
            color={'primary.purple'}
          >
            Privacy Policy
          </Link>
        </Checkbox>
      </Section>
      <Section title={'2. Choose network'} mt={'20px'}>
        <Flex h={'120px'} w={'100%'} overflowX={'auto'}>
          <HStack>{networkOptionsRendered}</HStack>
        </Flex>
      </Section>

      <Box mt={'20px'}>
        <Button {...connectBtnProps} />
      </Box>
    </>
  );
}

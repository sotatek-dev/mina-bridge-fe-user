'use client';
import CustomModal, { ModalTitle } from '@/components/elements/customModal';
import { MODAL_NAME } from '@/configs/modal';
import useModalSNLogic, { MODAL_CF_STATUS } from './hooks/useModalConfirmLogic';
import {
  Box,
  Button,
  Checkbox,
  Grid,
  GridItem,
  HStack,
  Heading,
  Image,
  Text,
  VStack,
} from '@chakra-ui/react';

import useNotifier from '@/hooks/useNotifier';
import Loading from '@/components/elements/loading/spinner';
import { useMemo } from 'react';
import ROUTES from '@/configs/routes';
import { useRouter } from 'next/navigation';
import { Link } from '@chakra-ui/next-js';

export default function ModalConfirmBridge() {
  const {
    dpAmount,
    networkInstance,
    modalPayload,
    displayValues,
    isAgreeTerm,
    onDismiss,
    status,
    toggleAgreeTerm,
    handleConfirm,
    handleCloseModal,
  } = useModalSNLogic({
    modalName: MODAL_NAME.CONFIRM_BRIDGE,
  });
  const { sendNotification } = useNotifier();
  const router = useRouter();

  const isDefault = useMemo(() => status === MODAL_CF_STATUS.IDLE, [status]);
  const isInitializing = useMemo(
    () => status === MODAL_CF_STATUS.INITIALIZE,
    [status]
  );
  const isLoading = useMemo(() => status === MODAL_CF_STATUS.LOADING, [status]);
  const hasError = useMemo(() => status === MODAL_CF_STATUS.ERROR, [status]);
  const isSuccess = useMemo(() => status === MODAL_CF_STATUS.SUCCESS, [status]);

  const isFreezeScreen = isInitializing || isLoading;

  const contentRendered = useMemo(() => {
    switch (true) {
      case isLoading:
        return (
          <VStack w={'full'} alignItems={'center'} py={'50px'} gap={'0'}>
            <Loading
              id={'modak-confirm-bridge'}
              w={'100px'}
              h={'100px'}
              spinnerSize={100}
              bgOpacity={0}
            />
            <Heading as={'h3'} variant={'h3'} color={'black'} mt={'20px'}>
              Waiting for confirmation
            </Heading>
            <Text variant={'md'} color={'text.500'} mt={'5px'}>
              Confirm this transaction in your wallet
            </Text>
          </VStack>
        );
      case hasError:
        return (
          <VStack gap={'0'} pt={'35px'}>
            <Image
              src={'/assets/icons/icon.error.circle.svg'}
              w={'80px'}
              h={'80px'}
            />
            <Heading as={'h3'} variant={'h3'} color={'black'} mt={'20px'}>
              Error
            </Heading>
            <Text variant={'md'} color={'text.500'} mt={'5px'}>
              Transaction rejected
            </Text>
          </VStack>
        );
      case isSuccess:
        return (
          <VStack gap={'0'} pt={'35px'}>
            <Image
              src={'/assets/icons/icon.success.circle.svg'}
              w={'80px'}
              h={'80px'}
            />
            <Heading as={'h3'} variant={'h3'} color={'black'} mt={'20px'}>
              Transaction Submitted
            </Heading>
            <Text
              variant={'md'}
              color={'text.500'}
              mt={'5px'}
              onClick={() => {
                onDismiss();
                handleCloseModal();
                router.push(ROUTES.HISTORY);
              }}
              cursor={'pointer'}
            >
              View on History
            </Text>
          </VStack>
        );

      case isDefault:
      case isInitializing:
      default:
        return (
          <>
            <Heading
              as={'h2'}
              variant={'h2'}
              mb={'15px'}
              color={'text.900'}
              textAlign={'center'}
            >
              {modalPayload
                ? `${dpAmount} ${modalPayload.asset.symbol.toUpperCase()}`
                : 0}
            </Heading>
            <Grid
              templateColumns={'repeat(2,1fr)'}
              gap={'60px'}
              position={'relative'}
              p={'20px'}
              bg={'rgba(130, 113, 240, 0.10)'}
              borderRadius={'10px'}
            >
              <GridItem>
                <VStack h={'full'} w={'full'} gap={'0'}>
                  <Text
                    variant={'lg_medium'}
                    color={'text.700'}
                    textAlign={'center'}
                  >
                    From
                  </Text>
                  <Box
                    display={'flex'}
                    h={'full'}
                    w={'full'}
                    bg={'linear-gradient(270deg, #DE622E 0%, #8271F0 100%)'}
                    borderRadius={'10px'}
                    p={'1px'}
                  >
                    <VStack
                      w={'full'}
                      bg={'white'}
                      borderRadius={'9px'}
                      py={'25'}
                      px={'10px'}
                    >
                      <Image
                        src={
                          networkInstance.src
                            ? networkInstance.src.metadata.logo.base
                            : ''
                        }
                        w={'40px'}
                        h={'40px'}
                      />
                      <Text
                        variant={'md_medium'}
                        color={'text.900'}
                        opacity={'0.5'}
                        textTransform={'capitalize'}
                        textAlign={'center'}
                      >
                        {networkInstance.src ? networkInstance.src.name : ''}{' '}
                        network
                      </Text>
                    </VStack>
                  </Box>
                </VStack>
              </GridItem>
              <GridItem>
                <VStack h={'full'} w={'full'} gap={'0'}>
                  <Text
                    variant={'lg_medium'}
                    color={'text.700'}
                    textAlign={'center'}
                  >
                    To
                  </Text>
                  <Box
                    display={'flex'}
                    h={'full'}
                    w={'full'}
                    bg={'linear-gradient(270deg, #DE622E 0%, #8271F0 100%)'}
                    borderRadius={'10px'}
                    p={'1px'}
                  >
                    <VStack
                      w={'full'}
                      bg={'white'}
                      borderRadius={'9px'}
                      py={'25'}
                      px={'10px'}
                    >
                      <Image
                        src={
                          networkInstance.tar
                            ? networkInstance.tar.metadata.logo.base
                            : ''
                        }
                        w={'40px'}
                        h={'40px'}
                      />
                      <Text
                        variant={'md_medium'}
                        color={'text.900'}
                        opacity={'0.5'}
                        textTransform={'capitalize'}
                        textAlign={'center'}
                      >
                        {networkInstance.tar ? networkInstance.tar.name : ''}{' '}
                        network
                      </Text>
                    </VStack>
                  </Box>
                </VStack>
              </GridItem>
              <Box
                position={'absolute'}
                top={'50%'}
                left={'50%'}
                transform={'translate(-50%,-50%)'}
              >
                <Image
                  src={'/assets/icons/icon.bridge.next.svg'}
                  w={'40px'}
                  h={'40px'}
                />
              </Box>
            </Grid>
            <VStack w={'full'} gap={'20px'} mt={'15px'}>
              {displayValues.map((item, index) => (
                <HStack
                  key={`${item.label}_${item.value}_${index}`}
                  w={'full'}
                  justifyContent={'space-between'}
                >
                  <Text variant={'lg'} color={'text.500'}>
                    {item.label}
                  </Text>
                  <HStack gap={'8px'}>
                    <Text variant={'lg_medium'} color={'text.900'}>
                      {item.value}
                    </Text>
                    <Image src={item.affixIcon} h={'24px'} />
                  </HStack>
                </HStack>
              ))}
            </VStack>
            <Box
              w={'full'}
              mt={'15px'}
              p={'10px 15px'}
              gap={'10px'}
              borderRadius={'8px'}
              bg={'rgba(222, 98, 46, 0.10)'}
            >
              <Text variant={'md'} color={'primary.orange'}>
                Please initiate a single transfer, we will only monitor the
                first transfer
              </Text>
            </Box>
            <Box w={'full'} mt={'15px'} gap={'12px'}>
              <Checkbox
                fontSize={'14px'}
                isChecked={isAgreeTerm}
                onChange={toggleAgreeTerm}
                alignItems={'flex-start'}
              >
                <Text>
                  I have read and agree to the{' '}
                  <Link
                    href={ROUTES.HOME}
                    target={'_blank'}
                    color={'primary.purple'}
                  >
                    Terms of Use
                  </Link>
                </Text>
              </Checkbox>
            </Box>
          </>
        );
    }
  }, [
    handleCloseModal,
    onDismiss,
    modalPayload,
    isAgreeTerm,
    isLoading,
    hasError,
    isSuccess,
    isDefault,
    isInitializing,
    toggleAgreeTerm,
    displayValues,
    networkInstance,
  ]);

  return (
    <CustomModal
      modalName={MODAL_NAME.CONFIRM_BRIDGE}
      title={
        isSuccess || hasError || isLoading ? null : (
          <ModalTitle>Confirm</ModalTitle>
        )
      }
      onClose={onDismiss}
      closeButton={isLoading ? <></> : undefined}
      modalOptions={{
        size: isSuccess || hasError || isLoading ? 'lg' : 'xl',
        scrollBehavior: 'inside',
        isCentered: true,
      }}
      isLoading={isFreezeScreen}
      footerElements={({ handleCloseModal }) => {
        async function handleOnClick() {
          if (!isAgreeTerm) return;
          if (isFreezeScreen)
            return sendNotification({
              toastType: 'warning',
              options: {
                title: 'A transaction is being process, please hold tight',
              },
            });

          await handleConfirm();
        }
        if (isLoading) return null;

        if (isSuccess || hasError)
          return (
            <Button
              variant={'primary.orange.solid'}
              w={'full'}
              h={'46px'}
              mt={'25px'}
              mx={'40px'}
              mb={'40px'}
              onClick={() => {
                onDismiss();
                handleCloseModal();
              }}
            >
              Dismiss
            </Button>
          );
        return (
          <Button
            variant={isAgreeTerm ? 'primary.orange.solid' : 'ghost'}
            w={'full'}
            h={'46px'}
            mt={'30px'}
            mb={'5px'}
            onClick={handleOnClick}
          >
            {isFreezeScreen ? (
              <Loading
                id={'modal-cf-bridge-cf-btn-loading'}
                w={'24px'}
                h={'24px'}
                bgOpacity={0}
                spinnerSize={24}
                spinnerThickness={8}
              />
            ) : (
              'Confirm'
            )}
          </Button>
        );
      }}
      footerProps={{ p: 0 }}
    >
      {contentRendered}
    </CustomModal>
  );
}
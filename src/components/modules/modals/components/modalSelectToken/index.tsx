'use client';

import ModalSTContent from './content';
import ModalSTProvider from './context';

import CustomModal, { ModalTitle } from '@/components/elements/customModal';
import { MODAL_NAME } from '@/configs/modal';

export type ModalSelectTokenProps = {};

export default function ModalSelectToken({}: ModalSelectTokenProps) {
  return (
    <CustomModal
      modalName={MODAL_NAME.SELECT_TOKEN}
      title={<ModalTitle>Select a token</ModalTitle>}
      modalOptions={{ size: 'lg', scrollBehavior: 'inside', isCentered: true }}
    >
      <ModalSTProvider modalName={MODAL_NAME.SELECT_TOKEN}>
        <ModalSTContent />
      </ModalSTProvider>
    </CustomModal>
  );
}

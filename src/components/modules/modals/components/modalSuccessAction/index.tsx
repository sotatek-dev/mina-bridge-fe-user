'use client';
import CustomModal from '@/components/elements/customModal';
import { MODAL_NAME } from '@/configs/modal';
import useModalSALogic from './hooks/useModalSALogic';

export default function ModalSuccessAction() {
  const { renderContentModal } = useModalSALogic();

  return (
    <CustomModal
      modalName={MODAL_NAME.SUCCESS_ACTION}
      modalOptions={{
        size: 'md',
        scrollBehavior: 'inside',
        isCentered: true,
      }}
    >
      {renderContentModal}
    </CustomModal>
  );
}

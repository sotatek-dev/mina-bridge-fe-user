'use client';
import { useProofOfAssetsState } from './context';
import ListAsset from './partial/listAsset';

import Loading from '@/components/elements/loading/spinner';
type Props = {};

export default function Content({}: Props) {
  const { isLoading } = useProofOfAssetsState().state;
  return isLoading ? (
    <Loading id={'bridge-form-loading'} w={'full'} h={'395px'} bgOpacity={0} />
  ) : (
    <>
      <ListAsset />
    </>
  );
}

'use client';

import { useModalSTState } from './context';
import ListAssets from './partial/listAssets';
import SearchInput from './partial/searchInput';

import Loading from '@/components/elements/loading/spinner';


type Props = {};

export default function ModalSTContent(props: Props) {
  const { isLoading } = useModalSTState().state;
  return isLoading ? (
    <Loading id={'modal_st_loading'} w={'full'} h={'395px'} bgOpacity={0} />
  ) : (
    <>
      <SearchInput />
      <ListAssets />
    </>
  );
}

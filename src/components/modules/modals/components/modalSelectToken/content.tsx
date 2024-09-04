import { useModalSTState } from './context';
import Loading from '@/components/elements/loading/spinner';
import SearchInput from './partial/searchInput';
import ListAssets from './partial/listAssets';

type Props = {};

export default function ModalSTContent(props: Props) {
  const { isLoading } = useModalSTState().state;
  return isLoading ? (
    <Loading id={"modal_st_loading"} w={"full"} h={"395px"} bgOpacity={0} />
  ) : (
    <>
      <SearchInput />
      <ListAssets />
    </>
  );
}

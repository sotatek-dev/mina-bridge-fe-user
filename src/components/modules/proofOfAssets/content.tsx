import Loading from '@/components/elements/loading/spinner';
import { useProofOfAssetsState } from './context';
import ListAsset from './partial/listAsset';
type Props = {};

export default function FormBridgeContent({}: Props) {
  const { isLoading } = useProofOfAssetsState().state;
  return isLoading ? (
    <Loading id={"bridge-form-loading"} w={"full"} h={"395px"} bgOpacity={0} />
  ) : (
    <>
      <ListAsset />
    </>
  );
}

import { getPersistSlice, useAppSelector } from '@/store';
import DisplayAsset from './displayAsset';
import { useMemo } from 'react';
import { TokenType } from '@/store/slices/persistSlice';
import { uniqBy } from 'lodash';

type Props = {};

export default function ListAsset({}: Props) {
  const { listAsset, listPair } = useAppSelector(getPersistSlice);

  function getAssetByPair(pairId: string) {
    let res: TokenType[] = [];
    Object.values(listAsset).forEach((assets) => {
      res.push(...assets.filter((asset) => asset.pairId === pairId));
    });
    return res;
  }

  function comparePairBySymbol(A: TokenType[], B: TokenType[]) {
    const serializeA = [A[0].symbol, A[1].symbol].join();
    const revertedA = [A[1].symbol, A[0].symbol].join();
    const serializeB = [B[0].symbol, B[1].symbol].join();
    return serializeA === serializeB || revertedA === serializeB;
  }

  // uniq pairs
  const uniqPairs = useMemo(() => {
    const combinedPairs = listPair.map((pair) => ({
      ...pair,
      children: getAssetByPair(pair.id.toString()),
    }));
    return combinedPairs.filter(
      (cur, index, output) =>
        index ===
        output.findIndex((v) => comparePairBySymbol(v.children, cur.children))
    );
  }, [listPair, listAsset]);

  // get asset by uniq pairs
  return (
    uniqPairs.length > 0 &&
    uniqPairs.map((pair) => (
      <DisplayAsset key={pair.id} assetSymbol={"ETH"} data={pair} />
    ))
  );
}

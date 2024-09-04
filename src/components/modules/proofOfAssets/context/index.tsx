import React, { useMemo, useState } from 'react';
import { useAppDispatch } from '@/store';

export type ProofOfAssetsState = {
  isLoading: boolean;
};

export type ProofOfAssetsCtxValueType = {
  state: ProofOfAssetsState;

  methods: {};
};
export type ProofOfAssetsProviderProps = React.PropsWithChildren<{}>;

export const initProofOfAssetsState: ProofOfAssetsState = {
  isLoading: false,
};

export const ProofOfAssetsCtx =
  React.createContext<ProofOfAssetsCtxValueType | null>(null);

export function useProofOfAssetsState() {
  return React.useContext(ProofOfAssetsCtx) as ProofOfAssetsCtxValueType;
}

export default function ProofOfAssetsProvider({
  children,
}: ProofOfAssetsProviderProps) {
  const dispatch = useAppDispatch();

  const [state, setState] = useState<ProofOfAssetsState>(
    initProofOfAssetsState
  );

  // final value
  const value = useMemo<ProofOfAssetsCtxValueType>(
    () => ({
      state,
      methods: {},
    }),
    [state]
  );

  // return statement
  return (
    <ProofOfAssetsCtx.Provider value={value}>
      {children}
    </ProofOfAssetsCtx.Provider>
  );
}

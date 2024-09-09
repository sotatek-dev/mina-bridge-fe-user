'use client';
import React, { useCallback, useMemo, useState } from 'react';

import { HistoryResponse, MetaDataHistory } from '@/services/usersService';

export type HistoryState = {
  pagingData: MetaDataHistory;
  data: HistoryResponse[];
};

export type HistoryCtxValueType = {
  state: HistoryState;
  methods: {
    updateMetaData: (newMetaData: MetaDataHistory) => void;
    updateData: (newData: HistoryResponse[]) => void;
  };
};
export type HistoryProviderProps = React.PropsWithChildren<{}>;

export const initPagingDataState: HistoryState = {
  pagingData: {
    hasNextPage: false,
    hasPreviousPage: false,
    total: 0,
    totalOfPages: 1,
    currentPage: 1,
    perPage: 0,
  },
  data: [],
};

export const HistoryContext = React.createContext<HistoryCtxValueType | null>(
  null
);

export function useHistoryState() {
  return React.useContext(HistoryContext) as HistoryCtxValueType;
}

export default function HistoryProvider({ children }: HistoryProviderProps) {
  const [state, setState] = useState<HistoryState>(initPagingDataState);

  const updateMetaData = useCallback(
    (newMetaData: MetaDataHistory) =>
      setState((prev) =>
        prev.pagingData !== newMetaData
          ? {
              ...prev,
              pagingData: newMetaData,
            }
          : prev
      ),
    [setState]
  );

  const updateData = useCallback(
    (newData: HistoryResponse[]) =>
      setState((prev) =>
        prev.data !== newData
          ? {
              ...prev,
              data: newData,
            }
          : prev
      ),
    [setState]
  );

  const value = useMemo<HistoryCtxValueType>(
    () => ({
      state,
      methods: { updateMetaData, updateData },
    }),
    [state, updateMetaData, updateData]
  );

  return (
    <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>
  );
}

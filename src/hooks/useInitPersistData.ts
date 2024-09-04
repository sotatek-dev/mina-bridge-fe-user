import { useAppDispatch } from '@/store';
import { persistSliceActions } from '@/store/slices/persistSlice';
import { useEffect } from 'react';

export default function useInitPersistData() {
  const dispatch = useAppDispatch();
  async function initData() {
    const res = dispatch(persistSliceActions.initializeData());
    // check fail
  }
  useEffect(() => {
    initData();
  }, []);
}

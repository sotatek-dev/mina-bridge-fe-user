import { useParams, usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { getWalletSlice, useAppSelector } from '@/store';
import ROUTES from '@/configs/routes';

const useRedirectRouter = () => {
  const pathName = usePathname();
  const router = useRouter();

  const { id } = useParams();

  const { isConnected } = useAppSelector(getWalletSlice);

  const privateRouter = useMemo(() => {
    return [ROUTES.HISTORY];
  }, [id]);

  useEffect(() => {
    if (!isConnected) {
      const isRedirect = privateRouter.includes(pathName as ROUTES);
      if (isRedirect) {
        router.replace(ROUTES.HOME);
      }
    }
  }, [isConnected, pathName]);
};

export default useRedirectRouter;

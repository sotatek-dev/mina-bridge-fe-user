import { getWalletSlice, useAppDispatch, useAppSelector } from '@/store';
import { walletSliceActions } from '@/store/slices/walletSlice';
import { Button, ButtonProps, Spinner } from '@chakra-ui/react';
import { useFormBridgeState } from '../context';
import { useEffect, useRef } from 'react';
import useNotifier from '@/hooks/useNotifier';

type Props = ButtonProps & {};

export default function NetworkSwitch({ ...props }: Props) {
  const dispatch = useAppDispatch();
  const { status } = useFormBridgeState().state;
  const { updateStatus } = useFormBridgeState().methods;
  const { sendNotification, checkNotifyActive } = useNotifier();
  const notifyRef = useRef<any>(null);

  async function handleClick() {
    if (status.isLoading || !status.isConnected) return;
    updateStatus('isLoading', true);
    const res = await dispatch(walletSliceActions.switchSrcTarNetwork());
    if (walletSliceActions.switchSrcTarNetwork.rejected.match(res)) {
      updateStatus('isLoading', false);
      if (notifyRef.current !== null && checkNotifyActive(notifyRef.current))
        return;

      notifyRef.current = sendNotification({
        toastType: 'error',
        options: {
          title: res.error.message,
        },
      });
      return;
    }
    // handle on success
    updateStatus('isLoading', false);
  }

  useEffect(() => {
    if (!status.isConnected) {
      updateStatus('isLoading', false);
    }
  }, [status.isConnected]);

  return (
    <Button variant={"_blank"} {...props} onClick={handleClick}>
      <svg
        xmlns={"http://www.w3.org/2000/svg"}
        width={"40"}
        height={"40"}
        viewBox={"0 0 40 40"}
        fill={"none"}
      >
        <circle cx={"20"} cy={"20"} r={"20"} fill={"url(#paint0_linear_5374_398)"} />
        {!status.isLoading && (
          <>
            <path
              fillRule={"evenodd"}
              clipRule={"evenodd"}
              d={"M15.892 11.152C16.2977 10.797 16.2977 10.2214 15.892 9.86636C15.4862 9.51134 14.8284 9.51134 14.4227 9.86636L8.87462 14.7209C8.46888 15.0759 8.46888 15.6515 8.87462 16.0066L14.4227 20.8611C14.8284 21.2161 15.4862 21.2161 15.892 20.8611C16.2977 20.5061 16.2977 19.9305 15.892 19.5755L12.1175 16.2728H22.2847C22.8585 16.2728 23.3237 15.8658 23.3237 15.3637C23.3237 14.8617 22.8585 14.4546 22.2847 14.4546H12.1175L15.892 11.152Z"}
              fill={"white"}
            />
            <path
              fillRule={"evenodd"}
              clipRule={"evenodd"}
              d={"M25.4004 19.576C24.9951 19.2206 24.3372 19.2201 23.9311 19.5747C23.525 19.9294 23.5244 20.505 23.9297 20.8604L27.6977 24.1636H17.537C16.9632 24.1636 16.498 24.5706 16.498 25.0727C16.498 25.5747 16.9632 25.9818 17.537 25.9818H27.6945L23.9304 29.2753C23.5247 29.6304 23.5247 30.206 23.9304 30.561C24.3362 30.916 24.994 30.916 25.3997 30.561L30.9374 25.7155C31.3429 25.3608 31.3432 24.7856 30.9381 24.4305L25.4004 19.576Z"}
              fill={"white"}
            />
          </>
        )}
        <defs>
          <linearGradient
            id={"paint0_linear_5374_398"}
            x1={"40"}
            y1={"20"}
            x2={"0"}
            y2={"20"}
            gradientUnits={"userSpaceOnUse"}
          >
            <stop stopColor={"#DE622E"} />
            <stop offset={"1"} stopColor={"#8271F0"} />
          </linearGradient>
        </defs>
      </svg>
      {status.isLoading && <Spinner position={"absolute"} color={"white"} />}
    </Button>
  );
}

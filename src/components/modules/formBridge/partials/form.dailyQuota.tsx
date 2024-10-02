'use client';
import { Heading } from "@chakra-ui/react";
import { useEffect, useRef } from "react";

import { DailyQuota, useFormBridgeState } from "../context";

import ITV from "@/configs/time";
import { handleRequest } from "@/helpers/asyncHandlers";
import { formatNumber, fromWei } from "@/helpers/common";
import usersService from "@/services/usersService";
import { getWalletSlice, useAppSelector } from "@/store";

const initialData: DailyQuota = {
  max: '0',
  current: '0',
  asset: '',
};

const recheckInterval = ITV.M5;

export default function FormDailyQuota() {
  const { address } = useAppSelector(getWalletSlice);
  const { dailyQuota, asset } = useFormBridgeState().state;
  const { updateQuota } = useFormBridgeState().methods;

  const interval = useRef<any>(null);

  async function getDailyQuota(address: string) {
    const [res, error] = await handleRequest(
      usersService.getDailyQuota({ address })
    );
    if (error || !res) return updateQuota({ ...initialData });
    return updateQuota({
      max: formatNumber(res.dailyQuota.dailyQuota, 4),
      current: formatNumber(
        fromWei(`${res.totalAmountOfToDay}`, asset!!.decimals),
        asset!!.decimals
      ),
      asset: res.dailyQuota.asset,
    });
  }

  useEffect(() => {
    if (!address || !asset) return;
    if (interval.current) clearInterval(interval.current);
    getDailyQuota(address);

    interval.current = setInterval(() => {
      getDailyQuota(address);
    }, recheckInterval);
    return () => {
      clearInterval(interval.current);
    };
  }, [address, asset]);

  return (
    address && (
      <Heading
        as={'h4'}
        variant={'h4'}
        color={'text.900'}
        mt={{ base: '15px', md: '20px' }}
        textAlign={'center'}
      >
        Daily quota {dailyQuota.max} {dailyQuota.asset} per address (
        {dailyQuota.current} {dailyQuota.asset} / {dailyQuota.max}{' '}
        {dailyQuota.asset})
      </Heading>
    )
  );
}

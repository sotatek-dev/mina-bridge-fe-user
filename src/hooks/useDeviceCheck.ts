"use client";
import { useAppDispatch } from "@/store";
import { persistSliceActions } from "@/store/slices/persistSlice";
import { useEffect } from "react";

export default function useDeviceCheck() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(persistSliceActions.deviceCheck());
  }, []);
}

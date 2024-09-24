"use client";
import {
  Button,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  StackProps,
  Text,
  VStack
} from "@chakra-ui/react";
import BigNumber from "bignumber.js";
import moment from "moment";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from "react";

import { useFormBridgeState } from "../context";

import Loading from "@/components/elements/loading/spinner";
import ITV from "@/configs/time";
import { handleRequest } from "@/helpers/asyncHandlers";
import { formatNumber, formWei, zeroCutterStart } from "@/helpers/common";
import { getWeb3Instance } from "@/helpers/evmHandlers";
import useNotifier from "@/hooks/useNotifier";
import Network, { NETWORK_TYPE } from "@/models/network/network";
import { Wallet } from "@/models/wallet";
import {
  getPersistSlice,
  getWalletInstanceSlice,
  getWalletSlice,
  useAppDispatch,
  useAppSelector
} from "@/store";
import { persistSliceActions, TokenType } from "@/store/slices/persistSlice";

const numberRegex = new RegExp(/^([0-9]{1,100}\.[0-9]{1,100})$|^([0-9]{1,100})\.?$|^\.([0-9]{1,100})?$/);

export type FormBridgeAmountRef = null | { resetValue: () => void };

type Props = {} & Pick<StackProps, ChakraBoxSizeProps>;

const Content = forwardRef<FormBridgeAmountRef, Props>((props, ref) => {
  type ErrorType = keyof typeof ErrorList | null;
  const dispatch = useAppDispatch();
  const { address, isConnected } = useAppSelector(getWalletSlice);
  const { walletInstance } = useAppSelector(getWalletInstanceSlice);

  const {
    status,
    asset,
    assetRange,
    balance,
    dailyQuota,
    srcNetwork,
    txEmitCount
  } = useFormBridgeState().state;
  const { nwProvider } = useFormBridgeState().constants;
  const { updateAmount, updateStatus, updateBalance } =
    useFormBridgeState().methods;

  const { lastNetworkFee } = useAppSelector(getPersistSlice);

  const [value, setValue] = useState<string>("");
  const [error, setError] = useState<ErrorType>(null);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  // timeout
  const throttleInput = useRef<any>(null);
  // interval
  const itvCheckBalance = useRef<any>(null);
  const itvFetchEVMFee = useRef<any>(null);

  const { sendNotification } = useNotifier();

  const ErrorList = useMemo(
    () => ({
      required: "This field is required",
      insufficient_fund: `Insufficient balance`,
      reach_min: `You have to bridge at least ${assetRange[0]} ${
        asset?.symbol || ""
      }`,
      reach_max: `You can only bridge maximum ${assetRange[1]} ${
        asset?.symbol || ""
      }`,
      insufficient_fund_fee: `Transaction can’t be made because of insufficient balance for transfer fee`,
      insufficient_daily_quota: `You can only bridge ${dailyQuota.max} ${
        asset?.symbol || ""
      } per address daily`
    }),
    [asset, assetRange, dailyQuota]
  );

  async function estimateFee() {
    if (!nwProvider || !address || !asset || !srcNetwork) return "0";

    if (lastNetworkFee && lastNetworkFee[srcNetwork.name].timestamp > 0) {
      const nwFee = lastNetworkFee[srcNetwork.name];
      if (
        nwFee.timestamp &&
        moment(moment.now()).diff(moment(nwFee.timestamp), "minute") <= 5
      ) {
        return;
      }
    }

    const gasAmount = "100000";
    updateStatus("isLoading", true);

    const [gasPrice, error] = await handleRequest(
      getWeb3Instance(nwProvider).eth.getGasPrice()
    );
    if (error || !gasPrice) return "0";
    const priceBN = new BigNumber(gasPrice?.toString() || "0").multipliedBy(10);
    const amountBN = new BigNumber(gasAmount.toString());
    updateStatus("isLoading", false);
    dispatch(
      persistSliceActions.setLastNwFee({
        nw: srcNetwork.name,
        data: {
          value: formWei(
            amountBN.multipliedBy(priceBN).toString(),
            asset.decimals
          ),
          timestamp: moment.now()
        }
      })
    );
    return;
  }

  // async function checkBalance() {
  async function checkBalance(
    address: string,
    asset: TokenType,
    srcNetwork: Network,
    walletInstance: Wallet
  ) {
    if (isFetching) return;

    setIsFetching(true);
    const [res, error] = await handleRequest(
      walletInstance.getBalance(srcNetwork, address, asset)
    );
    console.log("🚀 ~ checkBalance ~ res, error:", res, error);
    if (error || res === null) {
      if (balance === "0") {
        sendNotification({
          toastType: "error",
          options: {
            title: error.message
          }
        });
      }
      setIsFetching(false);
      return;
    }
    updateBalance(res);
    setIsFetching(false);
  }

  function dpError(e: ErrorType) {
    setError(e);
    updateAmount("");
  }

  function throttleActions(value: string) {
    if (throttleInput.current) clearTimeout(throttleInput.current);
    throttleInput.current = setTimeout(async () => {
      if (!asset) return;
      const [min, max] = assetRange;
      const bn = new BigNumber(value);
      console.log("🚀 ~ throttleInput.current=setTimeout ~ value:", value);
      const balanceBN = new BigNumber(balance);
      const availQuota = new BigNumber(dailyQuota.max).minus(
        new BigNumber(dailyQuota.current)
      );
      // return error
      if (bn.isNaN()) return dpError("required");
      if (bn.isLessThan(min)) return dpError("reach_min");
      if (bn.isGreaterThan(max)) return dpError("reach_max");
      if (bn.isGreaterThan(balanceBN)) return dpError("insufficient_fund");
      if (bn.isGreaterThan(availQuota))
        return dpError("insufficient_daily_quota");

      setError(null);
      // additional filter for evm chain
      if (
        srcNetwork &&
        srcNetwork.type === NETWORK_TYPE.EVM &&
        lastNetworkFee
      ) {
        const tFee = lastNetworkFee[srcNetwork.name].value;
        const tFeeBn = new BigNumber(tFee);
        const diffBalTFeeAm = balanceBN.minus(tFeeBn).minus(bn); // compare balance with amount and transfer fee
        const isAmHasToOffset = diffBalTFeeAm.isNegative(); // check if amount have to pay for transfer fee

        // amount of transfer value have to offset
        const AmOffsetAmount = isAmHasToOffset
          ? diffBalTFeeAm.multipliedBy(-1)
          : "0";
        const tfAmount = bn.minus(AmOffsetAmount);
        // if balance less then fee then user balance is not enough to bridge
        const isBalanceLTFee = balanceBN.minus(tFeeBn).isLessThan(0);

        // if transfer amount couldn't pay for offset
        const isInvalidTransferAm = tfAmount.isLessThan(0);

        // if transfer amount not exceed minimum amount
        const isTransferAmLTMin = tfAmount.isLessThan(min);

        if (isBalanceLTFee || isInvalidTransferAm || isTransferAmLTMin)
          return dpError("insufficient_fund_fee");
      }
      updateAmount(value);
    }, ITV.MS5);
  }

  function handleChangeValue(e: React.ChangeEvent<HTMLInputElement>) {
    if (status.isLoading || isFetching || !asset || !isConnected) {
      e.preventDefault();
      return;
    }
    if (e.currentTarget.value === '') {
      setValue('');
      return;
    }
    if (!numberRegex.test(e.currentTarget.value)) {
      e.preventDefault();
      return;
    }
    // in case delete value, reset amount to avoid user quickly submit
    if (e.currentTarget.value.length < 1) updateAmount("");
    const newValue = zeroCutterStart(e.currentTarget.value);
    setValue(newValue.length > 79 ? newValue.slice(0, 79) : newValue);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (
      status.isLoading ||
      isFetching ||
      !asset ||
      !isConnected
    ) {
      e.preventDefault();
      return;
    }
    if (throttleInput.current) clearTimeout(throttleInput.current);
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    if (status.isLoading || isFetching || !asset || !isConnected) {
      e.preventDefault();
      return;
    }
    const reg = "^[-]?[0-9]*\\.?[0-9]*$";
    const current = e.currentTarget.value;

    if (
      !e.clipboardData.getData("Text").match(reg) ||
      !(current + e.clipboardData.getData("Text")).match(reg)
    ) {
      e.preventDefault();
    }
    throttleActions(current + e.clipboardData.getData("Text"));
  }

  function handleKeyUp(e: React.KeyboardEvent<HTMLInputElement>) {
    if (status.isLoading || isFetching || !asset || !isConnected) {
      e.preventDefault();
      return;
    }
    throttleActions(e.currentTarget.value);
  }

  function updateValueToMax() {
    if (status.isLoading || isFetching || !asset || !isConnected) {
      return;
    }
    setValue(formatNumber(balance, asset.decimals));
    throttleActions(formatNumber(balance, asset.decimals));
  }

  useImperativeHandle(
    ref,
    () => ({
      resetValue: () => {
        setValue("");
        setError(null);
      }
    }),
    [setValue, setError]
  );

  useEffect(() => {
    if (!address || !asset || !walletInstance || !srcNetwork) {
      updateBalance("0");
      return;
    }
    if (itvCheckBalance.current) {
      clearInterval(itvCheckBalance.current);
      itvCheckBalance.current = null;
    }
    checkBalance(address, asset, srcNetwork, walletInstance);

    itvCheckBalance.current = setInterval(
      () => {
        checkBalance(address, asset, srcNetwork, walletInstance);
      },
      ITV.M5 // 5min
    );
    return () => {
      clearInterval(itvCheckBalance.current);
      itvCheckBalance.current = null;
    };
  }, [address, asset, walletInstance, srcNetwork, txEmitCount]);

  // frequently get gas price
  useEffect(() => {
    if (!srcNetwork) return;
    if (itvFetchEVMFee.current) {
      clearInterval(itvFetchEVMFee.current);
      itvFetchEVMFee.current = null;
    }
    switch (srcNetwork.type) {
      case NETWORK_TYPE.EVM:
        estimateFee();
        itvFetchEVMFee.current = setInterval(estimateFee, ITV.M5); // 5min
        return () => {
          clearInterval(itvFetchEVMFee.current);
          itvFetchEVMFee.current = null;
        };

      default:
        break;
    }
  }, [srcNetwork, nwProvider, address, asset, lastNetworkFee]);

  return (
    <VStack w={"full"} align={"flex-start"} gap={"4px"} {...props}>
      <Text variant={"lg_medium"} m={"0"}>
        Amount
      </Text>
      <InputGroup>
        <Input
          isDisabled={!isConnected}
          maxLength={79}
          isInvalid={isConnected && !!error}
          size={"md_medium"}
          type={"string"}
          pr={"75px"}
          inputMode={"decimal"}
          title={""}
          value={value}
          onChange={handleChangeValue}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onKeyUp={handleKeyUp}
          onWheel={(e) => e.currentTarget.blur()}
        />
        {status.isConnected ? (
          <InputRightElement w={"unset"} h={"48px"} pr={"12px"}>
            <Button
              variant={"primary.purple.solid.15"}
              h={"30px"}
              p={"6px 16px"}
              borderRadius={"5px"}
              onClick={updateValueToMax}
            >
              <Text variant={"md_semiBold"}>Max</Text>
            </Button>
          </InputRightElement>
        ) : null}
      </InputGroup>
      {status.isConnected && error ? (
        <Text variant={"md"} color={"red.500"}>
          {ErrorList[error]}
        </Text>
      ) : null}
      {status.isConnected ? (
        <HStack>
          <Text variant={"md"} color={"text.500"}>
            Available: {asset && formatNumber(balance, asset.decimals)}{" "}
            {(asset?.symbol.toUpperCase() || "") + " "}
            Tokens
          </Text>
          {isFetching && (
            <Loading
              id={"bridge-amount-loading"}
              bgOpacity={0}
              w={"15px"}
              h={"15px"}
              spinnerSize={15}
              spinnerThickness={8}
            />
          )}
        </HStack>
      ) : null}
    </VStack>
  );
});
const FormBridgeAmount = (props: Props) => {
  const { amountRef } = useFormBridgeState().constants;
  return <Content ref={amountRef} {...props} />;
};
export default FormBridgeAmount;

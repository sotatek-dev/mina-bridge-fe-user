'use client';
import { Image, Input, InputGroup, InputRightElement } from "@chakra-ui/react";
import React, { useRef, useState } from "react";

import { useModalSTState } from "../context";

import ITV from "@/configs/time";

type Props = {};

export default function SearchInput({}: Props) {
  const [value, setValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { listToken, listTokenDisplay } = useModalSTState().state;

  const { updateDpList } = useModalSTState().methods;

  const throttleInput = useRef<any>(null);

  function throttleActions(value: string) {
    if (throttleInput.current) {
      clearTimeout(throttleInput.current);
      throttleInput.current = null;
    }
    throttleInput.current = setTimeout(() => {
      const list = listToken.filter(
        (token) =>
          token.symbol.includes(value.trim().toUpperCase()) ||
          token.tokenAddr.includes(value.trim())
      );
      updateDpList(list);
      setIsLoading(false);
    }, ITV.MS5);
  }

  function handleChangeValue(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.currentTarget.value);
  }

  function handleKeyUp(e: React.KeyboardEvent<HTMLInputElement>) {
    setIsLoading(true);
    throttleActions(e.currentTarget.value);
  }
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (throttleInput.current) {
      clearTimeout(throttleInput.current);
      throttleInput.current = null;
      setIsLoading(false);
    }
  }

  return (
    <InputGroup>
      <InputRightElement h={'48px'} pr={'12px'}>
        <Image w={'22px'} h={'22px'} src={'/assets/icons/icon.search.svg'} />
      </InputRightElement>
      <Input
        size={'md'}
        m={'1px'}
        maxLength={255}
        pr={'40px'}
        placeholder={'Search name or paste address'}
        value={value}
        onChange={handleChangeValue}
        onKeyUp={handleKeyUp}
        onKeyDown={handleKeyDown}
        _placeholder={{
          color: 'text.400',
        }}
      />
    </InputGroup>
  );
}

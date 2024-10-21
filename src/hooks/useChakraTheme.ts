// 'use client';
import { useColorMode } from '@chakra-ui/react';
import Cookie from 'cookiejs';
import { useEffect } from 'react';

import { Theme } from '@/configs/constants';

export default function useChakraTheme() {
  const { colorMode, setColorMode } = useColorMode();

  const onToggleTheme = () => {
    const currentTheme = colorMode === Theme.DARK ? Theme.LIGHT : Theme.DARK;
    setColorMode(currentTheme);
    Cookie.set('theme', currentTheme, {
      expires: Infinity,
    });
  };

  // useEffect(() => {
  //   const theme = Cookie.get('theme');
  //   const curTheme = theme === Theme.DARK ? Theme.DARK : Theme.LIGHT;
  //   setColorMode(curTheme);
  // }, []);

  return {
    colorMode,
    onToggleTheme,
  };
}

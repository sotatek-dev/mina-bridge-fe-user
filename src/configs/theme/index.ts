import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

import styles from './styles';
import colors from './colors';
import fonts from './fonts';
import breakpoints from './breakpoints';
import components from './components';

// color configs

// common configs
const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

// styles config

// final theme
export default extendTheme({
  styles,
  config,
  colors,
  fonts,
  breakpoints,
  components,
});

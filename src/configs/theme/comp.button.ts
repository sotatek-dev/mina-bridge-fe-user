import { ComponentStyleConfig } from '@chakra-ui/react';

const Button: ComponentStyleConfig = {
  baseStyle: {
    px: '12px',
    py: '10px',
    paddingInlineStart: '12px',
    paddingInlineEnd: '12px',
    gap: '8px',
    border: '1.5px solid',
    borderColor: 'text.200',
    borderRadius: '8px',
    bg: 'white',
    backgroundColor: 'white',
    color: 'text.700',
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: '20px',
    height: '40px',
    boxShadow: '0px 1px 2px 0px rgba(16, 24, 40, 0.05)',
    alignItems: 'center',
  },
  variants: {
    'primary.purple': {
      bg: 'primary.purple',
      backgroundColor: 'primary.purple',
      borderColor: 'primary.purple',
      color: 'white',
    },
    'primary.purple.solid.15': {
      bg: 'rgba(130, 113, 240, 0.15)',
      backgroundColor: 'rgba(130, 113, 240, 0.15)',
      border: 'none',
      boxShadow: 'none',
      color: 'primary.purple',
    },
    'primary.orange': {
      bg: 'white',
      backgroundColor: 'white',
      borderColor: 'primary.orange',
      color: 'primary.orange',
      _hover: {
        base: {},
        md: {
          bg: 'primary.orange',
          backgroundColor: 'primary.orange',
          color: 'white',
        },
      },
    },
    'primary.orange.solid': {
      bg: 'primary.orange',
      backgroundColor: 'primary.orange',
      borderColor: 'primary.orange',
      color: 'white',
      _hover: {
        base: {},
        md: {
          bg: 'white',
          backgroundColor: 'white',
          color: 'primary.orange',
        },
      },
    },
    'disconnect.solid': {
      bg: 'text.700',
      backgroundColor: 'text.700',
      borderColor: 'text.700',
      color: 'white',
      _hover: {
        base: {},
        md: {
          bg: 'text.600',
          backgroundColor: 'text.600',
          color: 'white',
        },
      },
    },
    _blank: {
      bg: 'transparent',
      backgroundColor: 'transparent',
      border: 'none',
      w: 'auto',
      h: 'auto',
      m: 0,
      p: 0,
      paddingStart: 0,
      paddingEnd: 0,
      boxShadow: 'none',
    },
    input: {
      h: '48px',
      p: '12px',
      border: '1px solid',
      borderColor: 'text.200',
      bg: 'white',
      bgColor: 'white',
      _hover: {
        base: {},
        md: {
          bg: 'text.100',
        },
      },
    },
    ghost: {
      borderColor: 'text.300',
      bg: 'text.300',
      bgColor: 'text.300',
      color: 'white',
      cursor: 'not-allowed',
      _hover: {
        base: {},
        md: {
          borderColor: 'text.300',
          bg: 'text.300',
          bgColor: 'text.300',
          color: 'white',
        },
      },
      _active: {
        bg: 'text.300',
        bgColor: 'text.300',
        color: 'white',
      },
    },
    'icon.orange.solid': {
      bg: 'rgba(244, 111, 78, 0.10);',
      backgroundColor: 'rgba(244, 111, 78, 0.10);',
      border: 'none',
      w: 'auto',
      h: 'auto',
      m: 0,
      p: '8px',
      paddingStart: 0,
      paddingEnd: 0,
      borderRadius: '50%',
      boxShadow: 'none',
    },
  },
};

export default Button;

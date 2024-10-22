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
    bg: 'background.0',
    backgroundcolor: 'text.0',
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
      color: 'text.0',
    },
    'primary.purple.solid.15': {
      bg: 'rgba(130, 113, 240, 0.15)',
      backgroundColor: 'rgba(130, 113, 240, 0.15)',
      border: 'none',
      boxShadow: 'none',
      color: 'primary.purple',
    },
    'primary.orange': {
      bg: 'background.0',
      backgroundcolor: 'text.0',
      borderColor: 'primary.orange',
      color: 'primary.orange',
      _hover: {
        base: {},
        md: {
          bg: 'primary.orange',
          backgroundColor: 'primary.orange',
          color: 'text.0',
        },
      },
    },
    'primary.orange.solid': {
      bg: 'primary.orange',
      backgroundColor: 'primary.orange',
      borderColor: 'primary.orange',
      color: 'text.0',
      _hover: {
        base: {},
        md: {
          bg: 'background.0',
          backgroundcolor: 'text.0',
          color: 'primary.orange',
        },
      },
    },
    'disconnect.solid': {
      bg: 'text.700',
      backgroundColor: 'text.700',
      borderColor: 'text.700',
      color: 'text.0',
      _hover: {
        base: {},
        md: {
          bg: 'text.600',
          backgroundColor: 'text.600',
          color: 'text.0',
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
      bg: 'background.0',
      bgcolor: 'text.0',
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
      color: 'text.0',
      cursor: 'not-allowed',
      _hover: {
        borderColor: 'text.300',
        bg: 'text.300',
        bgColor: 'text.300',
        color: 'text.0',
      },
      _active: {
        bg: 'text.300',
        bgColor: 'text.300',
        color: 'text.0',
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

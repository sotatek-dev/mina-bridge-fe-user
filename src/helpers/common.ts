import BigNumber from 'bignumber.js';
import moment from 'moment';

import { ListFileName, ZkContractType } from '@/configs/constants';

// remove rounding config
// BigNumber.set({ ROUNDING_MODE: BigNumber.ROUND_DOWN });

export const isDevelopment = () =>
  process.env.NEXT_PUBLIC_ENV === 'development';
export const isFnc = <F>(maybeFnc: F | unknown): maybeFnc is F =>
  typeof maybeFnc === 'function';

export const truncateMid = (src: string, start: number, end: number) => [
  src?.slice(0, start),
  src?.slice(src.length - end, src.length),
];

export const toWei = (
  amount: string | number,
  decimal: string | number
): string => {
  decimal = typeof decimal === 'number' ? decimal : parseInt(decimal);
  return new BigNumber(amount)
    .multipliedBy(new BigNumber('1' + '0'.repeat(decimal)))
    .integerValue(BigNumber.ROUND_HALF_UP)
    .toString();
};

export const zeroCutterEnd = (value: string) => {
  const dotIndex = value.indexOf('.');
  if (dotIndex < 1) return value;

  let lastZeroIndex = 0;

  for (let i = value.length - 1; i >= 0; i--) {
    if (value.charAt(i) === '.') {
      lastZeroIndex = i;
      break;
    }
    if (value.charAt(i) !== '0') {
      lastZeroIndex = i + 1;
      break;
    }
  }
  return value.substring(0, lastZeroIndex);
};
export const truncatedNumber = (value: string, minumumNumber = 0.0001) => {
  const maxDecimal = minumumNumber.toString().split('.')[1].length;

  if (BigNumber(value).isEqualTo(0)) {
    return value;
  }

  if (BigNumber(value).lt(minumumNumber)) {
    return '<' + minumumNumber;
  }
  return new BigNumber(value || 0)
    .shiftedBy(0)
    .decimalPlaces(maxDecimal)
    .toFormat();
};

export const fromWei = (amount: string | number, decimal: string | number) => {
  decimal = typeof decimal === 'number' ? decimal : parseInt(decimal);
  if (decimal != 0) {
    const amountToBN = new BigNumber(amount);
    let decimalPow = '1' + '0'.repeat(decimal);

    const decimalToBN = new BigNumber(decimalPow);
    const newAmount = amountToBN.dividedBy(decimalToBN);
    return zeroCutterEnd(newAmount.toString());
  }

  if (amount.toString()?.indexOf('.') != -1) {
    amount = typeof amount === 'string' ? Number(amount) : amount;
    return (amount - (amount % 1) + 1).toString();
  }
  return zeroCutterEnd(amount.toString());
};

export const formatDateAndTime = (timestamp: string) => {
  const date = moment.unix(Number(timestamp));
  return date.format('YYYY-MM-DD HH:mm:ss');
};

export const formatDate = (datetime: string | number) => {
  return moment(datetime).format('YYYY-MM-DD');
};

export const formatTime = (datetime: string | number) => {
  return moment(datetime).format('HH:mm:ss');
};

export const getDecimal = (network: string) => {
  // response from api not match defined enum NETWORK_NAME
  const NETWORK_NAME = {
    MINA: 'mina',
    ETHER: 'eth',
  };
  switch (network) {
    case NETWORK_NAME.MINA:
      return 9;
    case NETWORK_NAME.ETHER:
      return 18;
    default:
      return 18;
  }
};

export function calculateAmountReceived(
  amountFrom: number,
  percentTip: number
) {
  // Ensure percentTip is within a valid range (0-100)
  if (percentTip < 0 || percentTip > 100) {
    throw new Error('Percent tip must be between 0 and 100');
  }

  // Convert percentTip to a decimal
  const tipDecimal = percentTip / 100;

  // Calculate the amount received using the formula
  const amountReceived = amountFrom - amountFrom * tipDecimal;

  return amountReceived;
}

export function formatNumber(
  balance: string,
  decimals: string | number,
  roundMode: BigNumber.RoundingMode = BigNumber.ROUND_HALF_UP
) {
  const balBN = new BigNumber(balance);
  const decNum = Number(decimals);
  if (decNum > 4) {
    return balBN.dp(4, roundMode).toString(10);
  }
  return balBN.dp(decNum, roundMode).toString(10);
}

export function formatNumber2(
  balance: string,
  decimals: string | number,
  prefixCharacter?: string
) {
  const balBN = new BigNumber(balance);
  const decNum = Number(decimals);
  const minimumNumber =
    decNum > 4 ? new BigNumber(10).pow(-4) : new BigNumber(10).pow(-decNum);

  if (balBN.eq(0)) return '0';

  let value = '0';
  if (decNum > 4) {
    value = truncatedNumber(balBN.toFixed(4));
  } else {
    value = truncatedNumber(balBN.toFixed(decNum));
  }

  if (value.includes('<')) {
    return value;
  }

  if (prefixCharacter?.includes('~') && balBN.lt(minimumNumber)) {
    return `~${new BigNumber(minimumNumber).toString(10)}`;
  }

  if (prefixCharacter) {
    return prefixCharacter + value;
  }
  return value;
}

export const zeroCutterStart = (value: string) => {
  if (value.indexOf('.') === 0) return '0' + value;
  return value.replace(/^0+/, '0');
};

export function bnMinus(srcVal: string | number, tarVal: string | number) {
  return new BigNumber(srcVal).minus(new BigNumber(tarVal));
}
export function bnAdd(srcVal: string | number, tarVal: string | number) {
  return new BigNumber(srcVal).plus(new BigNumber(tarVal));
}

export function bnMul(srcVal: string | number, tarVal: string | number) {
  return new BigNumber(srcVal).multipliedBy(new BigNumber(tarVal));
}

export function toAbsoluteUrl(pathname: string) {
  return window.location.origin + pathname;
}

export function getPxFromUrl(url?: string) {
  if (!url) return 'full';
  const match = url.match(/-(\d+px)\.png$/);
  if (!match) return 'full';
  return match[1];
}

export function fetchFiles(type: ZkContractType) {
  const listFiles = ListFileName[type];

  const publicStaticUri = process.env.NEXT_PUBLIC_BASE_PUBLIC_STATIC_URI || '';

  if (publicStaticUri) {
    return Promise.all(
      listFiles.map((file) => {
        return Promise.all([
          fetch(`${publicStaticUri}/o1js-v1/${file}.header`).then((res) =>
            res.text()
          ),
          fetch(`${publicStaticUri}/o1js-v1/${file}`).then((res) => res.text()),
        ]).then(([header, data]) => ({ file, header, data }));
      })
    ).then((cacheList) =>
      cacheList.reduce((acc: any, { file, header, data }) => {
        acc[file] = { file, header, data };
        return acc;
      }, {})
    );
  }

  return Promise.all(
    listFiles.map((file) => {
      return Promise.all([
        fetch(`/caches/o1js-v1/${file}.header`).then((res) => res.text()),
        fetch(`/caches/o1js-v1/${file}`).then((res) => res.text()),
      ]).then(([header, data]) => ({ file, header, data }));
    })
  ).then((cacheList) =>
    cacheList.reduce((acc: any, { file, header, data }) => {
      acc[file] = { file, header, data };
      return acc;
    }, {})
  );
}

export function fileSystem(files: any) {
  return {
    read({ persistentId, uniqueId, dataType }: any) {
      // read current uniqueId, return data if it matches
      if (!files[persistentId]) {
        return undefined;
      }

      if (dataType === 'string') {
        return new TextEncoder().encode(files[persistentId].data);
      }

      return undefined;
    },
    write() {
      // console.log('write');
    },
    canWrite: true,
  };
}

export function getScanUrl(networkName: string) {
  // response from api not match defined enum NETWORK_NAME
  const NETWORK_NAME = {
    MINA: 'mina',
    ETHER: 'eth',
  };

  return networkName === NETWORK_NAME.MINA
    ? process.env.NEXT_PUBLIC_REQUIRED_MINA_SCAN_URL
    : process.env.NEXT_PUBLIC_REQUIRED_ETH_SCAN_URL;
}
export const countExpectedTimes = (seconds: any): string => {
  const diffMinute = seconds / 60;
  const diffHour = seconds / 3600;
  const diffDay = seconds / 86400;

  const diffMonth = seconds / (30.44 * 86400);
  if (Math.floor(diffMonth) > 12) {
    return '> 12 months';
  }
  if (Math.floor(diffMonth) > 0) {
    return `${Math.floor(diffMonth)} months`;
  }
  if (Math.floor(diffDay) > 0) {
    return `${Math.floor(diffDay)} days`;
  }
  if (Math.floor(diffHour) > 0) {
    return `${Math.floor(diffHour)} hours`;
  }
  if (Math.floor(diffMinute) < 1) {
    return '< 1 minutes';
  }
  return `${Math.floor(diffMinute) || 1} minutes`;
};

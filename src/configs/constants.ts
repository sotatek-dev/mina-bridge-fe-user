export const ACCESS_TOKEN = 'token_access';
export const TERMS_OF_USE = 'terms_of_use';
export const HOOK_CACHE_FILE_NAMES = [
  'lagrange-basis-fp-1024',
  'lagrange-basis-fp-2048',
  'lagrange-basis-fp-4096',
  'lagrange-basis-fp-8192',
  'lagrange-basis-fp-16384',
  'lagrange-basis-fp-65536',
  'srs-fp-65536',
  'srs-fq-32768',
  'step-vk-hooks-canadmin',
  'step-vk-hooks-initialize',
  'wrap-vk-hooks',
];
export const TOKEN_CACHE_FILE_NAMES = [
  'lagrange-basis-fp-1024',
  'lagrange-basis-fp-2048',
  'lagrange-basis-fp-4096',
  'lagrange-basis-fp-8192',
  'lagrange-basis-fp-16384',
  'lagrange-basis-fp-65536',
  'srs-fp-65536',
  'srs-fq-32768',
  'step-vk-fungibletoken-approvebase',
  'step-vk-fungibletoken-burn',
  'step-vk-fungibletoken-getbalanceof',
  'step-vk-fungibletoken-getcirculating',
  'step-vk-fungibletoken-getdecimals',
  'step-vk-fungibletoken-getsupply',
  'step-vk-fungibletoken-initialize',
  'step-vk-fungibletoken-mint',
  'step-vk-fungibletoken-pause',
  'step-vk-fungibletoken-resume',
  'step-vk-fungibletoken-setadmin',
  'step-vk-fungibletoken-setowner',
  'step-vk-fungibletoken-setsupply',
  'step-vk-fungibletoken-transfer',
  'step-vk-fungibletoken-updateverificationkey',
  'step-vk-fungibletokenadmin-canchangeadmin',
  'step-vk-fungibletokenadmin-canmint',
  'step-vk-fungibletokenadmin-canpause',
  'step-vk-fungibletokenadmin-canresume',
  'step-vk-fungibletokenadmin-updateverificationkey',
  'wrap-vk-fungibletoken',
  'wrap-vk-fungibletokenadmin',
];

export const BRIDGE_CACHE_FILE_NAME = [
  'lagrange-basis-fp-1024',
  'lagrange-basis-fp-2048',
  'lagrange-basis-fp-4096',
  'lagrange-basis-fp-8192',
  'lagrange-basis-fp-16384',
  'lagrange-basis-fp-65536',
  'srs-fp-65536',
  'srs-fq-32768',
  'step-vk-bridge-changeadmin',
  'step-vk-bridge-config',
  'step-vk-bridge-decrementbalance',
  'step-vk-bridge-updatesetting',
  'step-vk-ecdsa-verifyecdsa',
  'step-vk-bridge-setvalidator',
  'step-vk-bridge-changemanager',
  'step-vk-bridge-changevalidatormanager',
  'step-vk-bridge-setamountlimits',
  'step-vk-manager-changeadmin',
  'step-vk-manager-changeminter',
  'step-vk-validatormanager-changevalidator',
  'wrap-vk-manager',
  'wrap-vk-validatormanager',
  'step-vk-bridge-lock',
  'step-vk-bridge-unlock',
  'wrap-vk-bridge',
  'wrap-vk-ecdsa',
];

export enum ZkContractType {
  HOOK = 'Hook',
  BRIDGE = 'Bridge',
  TOKEN = 'TOKEN',
}

export const ListFileName = {
  [ZkContractType.BRIDGE]: BRIDGE_CACHE_FILE_NAME,
  [ZkContractType.HOOK]: HOOK_CACHE_FILE_NAMES,
  [ZkContractType.TOKEN]: TOKEN_CACHE_FILE_NAMES,
};

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}

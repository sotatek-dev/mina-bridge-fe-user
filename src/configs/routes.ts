enum ROUTES {
  HOME = '/',
  PROOF_OF_ASSETS = '/proof-of-asset',
  USER_GUIDE = '/user-guide',
  INTERNAL_ERROR = '/error_500',
  HISTORY = '/history',
  TERMS_OF_SERVICE = '/term-of-service',
  PRIVACY_POLICY = '/privacy-policy',
}

export const PROTECTED_ROUTES = [ROUTES.HISTORY];

export const MDX_REDIRECT = 'bridging-fee';
export const MINA_SERCURITY_DIAGRAM = 'diagram';

export default ROUTES;

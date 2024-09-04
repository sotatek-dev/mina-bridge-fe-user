import { NETWORK_NAME } from '@/models/network';

import { useMemo } from 'react';
import Card from '../partials/card';

const networkOrder = [NETWORK_NAME.MINA, NETWORK_NAME.ETHEREUM];

export default function CardContainer() {
  return useMemo(
    () => networkOrder.map((key) => <Card key={key} nwKey={key} />),
    []
  );
}

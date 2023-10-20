import { JsonRpcProvider } from 'ethers';
import { RouterProtocol } from '@routerprotocol/router-js-sdk';

import { SDK_ID, CHAIN } from "../constants";

export const initializeRouterProtocol = async () => {
  const provider = new JsonRpcProvider(CHAIN.rpcUrls.default.http[0], CHAIN.id)

  const protocol = new RouterProtocol(
    SDK_ID,
    String(CHAIN.id),
    provider as any,
  );

  await protocol.initialize();
};

import {
  ethers,
  getAddress,
  JsonRpcProvider,
  MaxUint256,
  parseUnits
} from 'ethers';
import { RouterProtocol } from '@routerprotocol/router-js-sdk';

import { SDK_ID, CHAIN } from '../constants';

export const initializeRouterProtocol = async () => {
  const provider = new JsonRpcProvider(CHAIN.rpcUrls.default.http[0], CHAIN.id);

  const protocol = new RouterProtocol(
    SDK_ID,
    String(CHAIN.id),
    provider as any
  );

  await protocol.initialize();

  return {
    protocol,
    provider
  };
};

interface GetQuoteParams {
  protocol: RouterProtocol;
  amount: string;
  fromAddress: string;
  fromToken: string;
  toAddress: string;
  toToken: string;
  toChainId: string;
}

export const getProtocolQuote = async ({
  protocol,
  amount,
  fromAddress,
  fromToken,
  toAddress,
  toToken,
  toChainId
}: GetQuoteParams) => {
  const args = {
    amount: parseUnits(amount, 6).toString(),
    user_address: fromAddress,
    src_token_address: fromToken,
    receiver_address: toAddress,
    dest_token_address: toToken,
    dest_chain_id: toChainId,
    fee_token_address: '0x16ECCfDbb4eE1A85A33f3A9B21175Cd7Ae753dB4',
    slippage_tolerance: 2.0
  };

  return {
    quote: await protocol.getQuote(
      args.amount,
      args.dest_chain_id,
      args.src_token_address,
      args.dest_token_address,
      args.user_address,
      args.receiver_address,
      args.fee_token_address,
      args.slippage_tolerance
    ),
    args
  };
};

interface CheckAndSetAllowanceParams {
  protocol: RouterProtocol;
  provider: JsonRpcProvider;
  args: any;
  privateKey: string;
}

export const checkAndSetAllowance = async ({
  provider,
  protocol,
  args,
  privateKey
}: CheckAndSetAllowanceParams) => {
  const wallet = new ethers.Wallet(privateKey, provider);

  let src_token_allowance = await protocol.getSourceTokenAllowance(
    args.src_token_address,
    args.dest_chain_id,
    args.user_address
  );
  if (src_token_allowance.lt(MaxUint256)) {
    await protocol.approveSourceToken(
      args.src_token_address,
      args.user_address,
      MaxUint256.toString(),
      args.dest_chain_id,
      wallet as any
    );
  }
  if (
    getAddress(args.src_token_address) !== getAddress(args.fee_token_address)
  ) {
    let fee_token_allowance = await protocol.getFeeTokenAllowance(
      args.fee_token_address,
      args.dest_chain_id,
      args.user_address
    );
    if (fee_token_allowance.lt(MaxUint256)) {
      await protocol.approveFeeToken(
        args.fee_token_address,
        args.user_address,
        MaxUint256.toString(),
        wallet as any
      );
    }
  }
};

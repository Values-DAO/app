import {
  FallbackProvider,
  JsonRpcProvider,
  BrowserProvider,
  JsonRpcSigner,
} from "ethers";
import { privateKeyToAccount } from "viem/accounts";
import { useMemo } from "react";
import type { Account, Chain, Client, Transport } from "viem";
import { type Config, useClient, useConnectorClient } from "wagmi";

function clientToProvider(client: Client<Transport, Chain>) {
  const { chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  if (transport.type === "fallback") {
    const providers = (transport.transports as ReturnType<Transport>[]).map(
      ({ value }) => new JsonRpcProvider(value?.url, network)
    );
    if (providers.length === 1) return providers[0];
    return new FallbackProvider(providers);
  }
  return new JsonRpcProvider(transport.url, network);
}

/** Action to convert a viem Client to an ethers.js Provider. */
export function useProvider({ chainId }: { chainId?: number } = {}) {
  const client = useClient<Config>({ chainId });
  return useMemo(
    () => (client ? clientToProvider(client) : undefined),
    [client]
  );
}

function clientToSigner(client: Client<Transport, Chain, Account>) {
  const { chain, transport } = client;
  const account = privateKeyToAccount(process.env.NEXT_PUBLIC_PRIVATE_KEY as `0x${string}`)
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new BrowserProvider(transport, network);
  const signer = new JsonRpcSigner(provider, account.address);
  return signer;
}

/** Hook to convert a viem Wallet Client to an ethers.js Signer. */
export function useSigner({ chainId }: { chainId?: number } = {}) {
  const { data: client } = useConnectorClient<Config>({ chainId });
  console.log(client?.account.address);
  return useMemo(() => (client ? clientToSigner(client) : undefined), [client]);
}

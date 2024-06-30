"use client";

import {PrivyProvider} from "@privy-io/react-auth";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {createConfig, WagmiProvider} from "@privy-io/wagmi";
import {mainnet, base, baseSepolia, polygon, optimism} from "viem/chains";
import {http} from "wagmi";

import {createPublicClient, createWalletClient} from "viem";
import {privateKeyToAccount} from "viem/accounts";

export const viemPublicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC || ""),
});

export const viemWalletClient = createWalletClient({
  chain: baseSepolia,
  transport: http(),
  account: privateKeyToAccount(
    process.env.NEXT_PUBLIC_ADMIN_WALLET_PRIVATE_KEY as `0x${string}`
  ),
});

export const config = createConfig({
  chains: [mainnet, base, baseSepolia, polygon, optimism],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [baseSepolia.id]: http(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC || ""),
    [polygon.id]: http(),
    [optimism.id]: http(),
  },
});

export default function Providers({children}: {children: React.ReactNode}) {
  const queryClient = new QueryClient();

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
      config={{
        appearance: {
          theme: "light",
          accentColor: "#f5d442",
        },
        loginMethods: ["farcaster", "email"],
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>{children}</WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}

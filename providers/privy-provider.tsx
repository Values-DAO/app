"use client";

import {PrivyProvider} from "@privy-io/react-auth";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {createConfig, WagmiProvider} from "@privy-io/wagmi";
import {mainnet, base, baseSepolia, polygon} from "viem/chains";
import {http} from "wagmi";

export const config = createConfig({
  chains: [mainnet, base, baseSepolia, polygon],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [baseSepolia.id]: http(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC || ""),
    [polygon.id]: http(),
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
        loginMethods: ["email", "wallet", "farcaster"],
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>{children}</WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}

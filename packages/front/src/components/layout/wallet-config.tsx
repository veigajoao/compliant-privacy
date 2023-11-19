import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets } from "@rainbow-me/rainbowkit";
import { configureChains, createConfig } from "wagmi";
import { mainnet } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";

const { chains, publicClient } = configureChains([mainnet], [publicProvider()]);
const { connectors } = getDefaultWallets({
  appName: "SafeSwim",
  projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID,
  chains,
});
export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

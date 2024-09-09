import { Chain, PrepareTransactionRequestParameters, SignTypedDataParameters, WalletClient } from "viem";
import { SafeSignerRequest } from "../server/safeSigner";
import { compareChains, getChain } from "../utils/chains";
import { Socket } from "socket.io-client";

export const switchChain = async (socket: Socket, walletClient: WalletClient, req: SafeSignerRequest): Promise<boolean> => {
try {
    // Find chain from request
    let chain: Chain | string | number | undefined | null;
    if ((req as unknown as SignTypedDataParameters)?.domain?.chainId) {
      chain = (req as unknown as SignTypedDataParameters)?.domain?.chainId;
    } else if ((req as PrepareTransactionRequestParameters)?.chain) {
      chain = (req as PrepareTransactionRequestParameters)?.chain;
    }

    // Switch chain if needed
    if (chain) {
      const requestChain = getChain(chain);
      if (!requestChain) {
        console.error("Invalid chain:", chain);
        throw new Error("Unsupported chain");
      }
      const chainId = requestChain.id;
      const currentChainId = walletClient?.chain?.id;

      if (!compareChains(currentChainId as number, chainId)) {
        try {
          await walletClient?.switchChain({ id: chainId });
        } catch (error: any) {
          // Handle chain not found error
          if (error.code == 4902) {
            // Adding the chain
            await walletClient?.addChain({ chain: requestChain });
            await walletClient?.switchChain({ id: chainId });
          } else {
            throw error;
          }
        }
      }
    }
    return true;
  } catch (error: any) {
    console.error("Failed to switch chain:", error);
    socket.emit("response", { error: error?.message });
    return false;
  }
};
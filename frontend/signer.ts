import { PrepareTransactionRequestParameters, SignMessageParameters, SignTransactionParameters, SignTypedDataParameters, WalletClient } from "viem";
import { SafeSignerRequest } from "../server/safeSigner";
import { Socket } from "socket.io-client";

export const handleRequest = async (socket: Socket, walletClient: WalletClient ,req: SafeSignerRequest) => {
    try {
      let response;

      try {
        // Handle different types of requests
        if ((req as SignTypedDataParameters).types) {
          const signed = await walletClient?.signTypedData(
            req as unknown as SignTypedDataParameters
          );
          response = { data: signed };
        } else if ((req as SignMessageParameters).message) {
          const signed = await walletClient?.signMessage(
            req as unknown as SignMessageParameters
          );
          response = { data: signed };
        } else if (req as PrepareTransactionRequestParameters) {
          const tx = await walletClient?.prepareTransactionRequest(req as PrepareTransactionRequestParameters);
          const signed = await walletClient?.sendTransaction(
            tx as unknown as SignTransactionParameters<any,any>
          );
          response = { data: signed };
        } 
      } catch (error: any) {
        console.error(error);
        response = { error: error?.message };
      }

      socket.emit("response", response);
    } catch (error) {
      console.error("Failed to sign message:", error);
    }
  };
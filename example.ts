import SafeSigner, { SafeSignerRequest } from './server/safeSigner';
const messageRequest = {
  message: 'Hello, world!'
};

const signTypedDataRequest = {
  domain: {
    name: "EIP-712 Message",
    version: "1",
    chainId: 56,
  },
  types: {
    Person: [
      {
        name: "name",
        type: "string",
      },
      {
        name: "wallet",
        type: "address",
      },
    ],
    Mail: [
      {
        name: "from",
        type: "Person",
      },
      {
        name: "to",
        type: "Person",
      },
      {
        name: "contents",
        type: "string",
      },
    ],
  },
  primaryType: "Mail",
  message: {
    from: {
      name: "Alice",
      wallet: "0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa",
    },
    to: {
      name: "Bob",
      wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
    },
    contents: "Hello, Bob!",
  },
}

const transactionRequest = {
    to: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
    value: 0,
    chain: 111555111
};

async function main() {
  const signer = new SafeSigner();
  
  await signer.start();
  console.log("SafeSigner started");
  try {
    console.log("Asking for signature on message");
    const response = await signer.sendRequest(messageRequest as SafeSignerRequest);
    console.log('Message signature:', response);
    console.log("Asking for signature on EIP712 Typed Data Message");
    const responseAgain = await signer.sendRequest(signTypedDataRequest as unknown as SafeSignerRequest);
    console.log('Typed message signature:', responseAgain);
    console.log("Asking for signature and broadcast of transaction");
    const responseAgainAgain = await signer.sendRequest(transactionRequest as unknown as SafeSignerRequest);
    console.log('Transaction submitted:', responseAgainAgain);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    signer.stop();
  }
}

main();
// This is a script for starting SafeSigner in case you want to use the http server to communicate with the client.
import SafeSigner from '../server/safeSigner';

async function main() {
    const signer = new SafeSigner();
  
    await signer.start();
    console.log("SafeSigner started");
}

(async () => await main())();
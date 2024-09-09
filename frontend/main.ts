import './style.css'
import typescriptLogo from './typescript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.ts'
import { connectSocket } from './socket.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank">
      <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
    </a>
    <h1>Vite + TypeScript</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite and TypeScript logos to learn more
    </p>
  </div>
`

setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)

import { createWeb3Modal } from '@web3modal/wagmi'
import { config, projectId } from './wagmi.ts'



// 3. Create modal
const modal = createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableOnramp: false,
  enableSwaps: false,
  excludeWalletIds: ['e7c4d26541a7fd84dbdfa9922d3ad21e936e13a7a0e44385d44f006139e44d3b','c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96'],
});

connectSocket(modal);

modal.open();

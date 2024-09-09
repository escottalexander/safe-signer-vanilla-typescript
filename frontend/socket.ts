import io from 'socket.io-client';
import { SafeSignerRequest } from '../server/safeSigner';
import { getWalletClient } from '@wagmi/core';
import { config } from './wagmi';
import { switchChain } from './switchChain';
import { handleRequest } from './signer';
import { wait } from '../utils';
import { disconnect } from '@wagmi/core'
import { AppKit } from '@web3modal/base';

export const connectSocket = (modal: AppKit) => {
    let walletReady = false;

    modal.subscribeEvents(newState => {
        console.log('New Event:', newState);
        console.log("connected:", modal.getIsConnectedState());
        if (modal.getIsConnectedState()) {
            walletReady = true;
        } else {
            walletReady = false;
        }
    });


    console.log('Connecting to server');
    const socket = io();
    socket.on('connect', () => {
        console.log('Connected to server');
        socket.emit('ready');
    });
    
    socket.on('request', async (newRequest: SafeSignerRequest) => {
        while (!walletReady) {
            console.log('Waiting for wallet client');
            await wait(1000);
        }
        let walletClient = await getWalletClient(config);
        const continueNext = await switchChain(socket, walletClient, newRequest);
        if (continueNext) {
            await handleRequest(socket, walletClient, newRequest);
        }
    });
    
    socket.on('disconnect', async () => {
        console.log('Disconnected from server');

        disconnect(config);
        window.close();
    });
    
    window.addEventListener('beforeunload', () => {
        socket.disconnect();
    });
    return socket;
};
import {chains, getChainById, getChainByName, getChain, compareChains } from "./chains"

export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
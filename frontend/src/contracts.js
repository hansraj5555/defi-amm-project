import { AMM_ABI, AMM_ADDRESS, ERC20_ABI, TOKEN_ADDRESS } from './config'
import { ethers } from 'ethers'

export async function getProvider() {
  if (!window.ethereum) throw new Error('No injected wallet found')
  const provider = new ethers.BrowserProvider(window.ethereum)
  return provider
}

export async function getSigner() {
  const provider = await getProvider()
  return provider.getSigner()
}

export async function getAmmContract() {
  const signer = await getSigner()
  return new ethers.Contract(AMM_ADDRESS, AMM_ABI, signer)
}

export async function getTokenContract() {
  const signer = await getSigner()
  return new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, signer)
}

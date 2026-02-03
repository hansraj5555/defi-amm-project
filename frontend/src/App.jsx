import { useEffect, useState } from "react";
import { ethers } from 'ethers'
import { getProvider, getAmmContract, getTokenContract } from "./contracts";
import { AMM_ADDRESS, TOKEN_ADDRESS } from "./config";

function App() {
  const [account, setAccount] = useState("");
  const [reserves, setReserves] = useState({ reserveA: null, reserveB: null });
  const [tokenDecimals, setTokenDecimals] = useState(18);
  const [tokenBalance, setTokenBalance] = useState(null);
  const [amountIn, setAmountIn] = useState("");
  const [status, setStatus] = useState("");

  async function connectWallet() {
    try {
      const provider = await getProvider();
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      setAccount(addr);
      // load token balance on connect
      try {
        const token = await getTokenContract();
        const bal = await token.balanceOf(addr);
        setTokenBalance(bal.toString());
      } catch (err) {
        setTokenBalance(null);
      }
    } catch (err) {
      setStatus(err.message || String(err));
    }
  }

  async function loadReserves() {
    try {
      const amm = await getAmmContract();
      const r = await amm.getReserves();
      // r may be BigNumber array-like
      const reserveA = r[0];
      const reserveB = r[1];

      // try to get token decimals for nicer display/parsing
      try {
        const token = await getTokenContract();
        const d = await token.decimals();
        setTokenDecimals(Number(d));
      } catch (err) {
        // fallback to 18
        setTokenDecimals(18);
      }

      setReserves({ reserveA: reserveA.toString(), reserveB: reserveB.toString() });
    } catch (err) {
      setStatus('Unable to load reserves: ' + err.message);
    }
  }

  async function loadBalance() {
    if (!account) return;
    try {
      const token = await getTokenContract();
      const bal = await token.balanceOf(account);
      setTokenBalance(bal.toString());
    } catch (err) {
      setStatus('Unable to load balance: ' + err.message);
    }
  }

  async function handleSwap(e) {
    e.preventDefault();
    setStatus('Sending swap...');
    try {
      if (!account) {
        setStatus('Connect wallet first');
        return;
      }
      const amm = await getAmmContract();
      const token = await getTokenContract();

      // parse human-readable amount into smallest unit using token decimals
      const parsedAmount = ethers.parseUnits(amountIn || '0', tokenDecimals);

      // check allowance
      const allowanceBn = await token.allowance(account, AMM_ADDRESS);
      if (BigInt(allowanceBn.toString()) < BigInt(parsedAmount.toString())) {
        setStatus('Approving tokens for AMM...');
        const approveTx = await token.approve(AMM_ADDRESS, parsedAmount);
        await approveTx.wait();
        setStatus('Approved — sending swap...');
      }

      const tx = await amm.swapExactTokensForTokens(parsedAmount, 0);
      await tx.wait();
      setStatus('Swap confirmed');
      loadReserves();
    } catch (err) {
      setStatus('Swap failed: ' + (err.message || String(err)));
    }
  }

  useEffect(() => {
    // try to load reserves on mount if addresses are set
    if (AMM_ADDRESS && AMM_ADDRESS !== "0x0000000000000000000000000000000000000000") {
      loadReserves();
    }
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>DeFi AMM</h2>
      <div style={{ marginBottom: 12 }}>
        <button onClick={connectWallet}>Connect Wallet</button>
        <span style={{ marginLeft: 12 }}>{account}</span>
      </div>

      <div style={{ marginBottom: 12 }}>
        <strong>AMM:</strong> {AMM_ADDRESS}
        <br />
        <strong>Token:</strong> {TOKEN_ADDRESS}
      </div>

      <div style={{ marginBottom: 12 }}>
        <h4>Pool Reserves</h4>
        <div>Reserve A: {reserves.reserveA ? ethers.formatUnits(reserves.reserveA, tokenDecimals) : '—'}</div>
        <div>Reserve B: {reserves.reserveB ? ethers.formatUnits(reserves.reserveB, tokenDecimals) : '—'}</div>
        <button onClick={loadReserves} style={{ marginTop: 8, marginRight: 8 }}>Refresh</button>
        <button onClick={loadBalance} style={{ marginTop: 8 }}>Refresh Balance</button>
        <div style={{ marginTop: 8 }}>Balance: {tokenBalance ? ethers.formatUnits(tokenBalance, tokenDecimals) : '—'}</div>
      </div>

      <form onSubmit={handleSwap} style={{ marginBottom: 12 }}>
        <h4>Swap</h4>
        <label>
          Amount:
          <input placeholder="0.0" value={amountIn} onChange={e => setAmountIn(e.target.value)} style={{ marginLeft: 8 }} />
        </label>
        <button type="submit" style={{ marginLeft: 8 }}>Swap</button>
      </form>

      <div>
        <strong>Status:</strong> {status}
      </div>
    </div>
  );
}

export default App;

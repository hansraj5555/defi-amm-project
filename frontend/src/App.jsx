import { useEffect, useState } from "react";
import { getProvider, getAmmContract, getTokenContract } from "./contracts";
import { AMM_ADDRESS, TOKEN_ADDRESS } from "./config";

function App() {
  const [account, setAccount] = useState("");
  const [reserves, setReserves] = useState({ reserveA: null, reserveB: null });
  const [amountIn, setAmountIn] = useState("");
  const [status, setStatus] = useState("");

  async function connectWallet() {
    try {
      const provider = await getProvider();
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      setAccount(await signer.getAddress());
    } catch (err) {
      setStatus(err.message || String(err));
    }
  }

  async function loadReserves() {
    try {
      const amm = await getAmmContract();
      const r = await amm.getReserves();
      // r may be BigNumber array-like
      setReserves({ reserveA: r[0].toString(), reserveB: r[1].toString() });
    } catch (err) {
      setStatus('Unable to load reserves: ' + err.message);
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

      // using raw smallest-unit input for now
      const wei = amountIn;

      // check allowance
      const allowanceBn = await token.allowance(account, AMM_ADDRESS);
      const allowanceStr = allowanceBn.toString();
      if (BigInt(allowanceStr) < BigInt(wei)) {
        setStatus('Approving tokens for AMM...');
        const approveTx = await token.approve(AMM_ADDRESS, wei);
        await approveTx.wait();
        setStatus('Approved — sending swap...');
      }

      const tx = await amm.swapExactTokensForTokens(wei, 0);
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
        <div>Reserve A: {reserves.reserveA ?? '—'}</div>
        <div>Reserve B: {reserves.reserveB ?? '—'}</div>
        <button onClick={loadReserves} style={{ marginTop: 8 }}>Refresh</button>
      </div>

      <form onSubmit={handleSwap} style={{ marginBottom: 12 }}>
        <h4>Swap</h4>
        <label>
          Amount (raw units):
          <input value={amountIn} onChange={e => setAmountIn(e.target.value)} style={{ marginLeft: 8 }} />
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

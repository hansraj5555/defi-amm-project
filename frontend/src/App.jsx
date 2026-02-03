import { ethers } from "ethers";
import { useState } from "react";

function App() {
  const [account, setAccount] = useState("");

  async function connectWallet() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    setAccount(await signer.getAddress());
  }

  return (
    <div>
      <h2>DeFi AMM</h2>
      <button onClick={connectWallet}>Connect Wallet</button>
      <p>{account}</p>
    </div>
  );
}

export default App;

import { For, type Component, Show, createMemo, onMount, createSignal } from "solid-js"
import solidLogo from "./assets/logo.svg"
import githubLogo from "./assets/github-mark.svg"
import { AtomicTransactionComposer, makePaymentTxnWithSuggestedParamsFromObject } from "algosdk"
import { UseSolidAlgoWallets, UseNetwork, NetworkName } from "solid-algo-wallets"
import algonode from "./assets/algonode.png"

export function ellipseString(string = "", width = 4): string {
  return `${string.slice(0, width)}...${string.slice(-width)}`
}

const App: Component = () => {
  const {
    activeWallet,
    walletName,
    address,
    connectWallet,
    reconnectWallet,
    disconnectWallet,
    walletInterfaces,
    transactionSigner,
  } = UseSolidAlgoWallets
  const { algodClient, activeNetwork, setActiveNetwork, networkNames, getTxUrl } = UseNetwork
  const [confirmedTxn, setConfirmedTxn] = createSignal("")

  onMount(() => reconnectWallet())

  async function sendTxn() {
    setConfirmedTxn("")
    const suggestedParams = await algodClient().getTransactionParams().do()

    const payTxn = makePaymentTxnWithSuggestedParamsFromObject({
      from: address(),
      to: address(),
      amount: 0,
      suggestedParams,
    })

    const atc = new AtomicTransactionComposer()
    atc.addTransaction({
      signer: transactionSigner,
      txn: payTxn
    })
    const result = await atc.execute(algodClient(), 4)
    console.log("Txn confirmed: ", result)
    setConfirmedTxn(result.txIDs[0])
  }

  return (
    <div class="flex h-screen flex-col items-center justify-start p-4 text-center">
      <img
        src={solidLogo}
        class="logo"
        alt="SolidJS logo"
      />
      <h1 class="text-3xl font-bold">Solid Algo Wallets</h1>
      <div class="flex flex-row">
        <h2 class="inline text-2xl">Example App</h2>
        <a
          href="https://github.com/SilentRhetoric/solid-algo-wallets-example"
          target="_blank"
        >
          <img
            src={githubLogo}
            class="ml-2 h-8 w-8"
            alt="GitHub logo"
          />
        </a>
      </div>
      <select
        class="select select-accent m-1 max-w-xs"
        onChange={(e) => setActiveNetwork(e.target.value as NetworkName)}
        value={activeNetwork()}
      >
        <option
          disabled
          selected
        >
          Select Network
        </option>
        <For each={networkNames}>{(network) => <option value={network}>{network}</option>}</For>
      </select>
      <Show
        when={activeWallet() === undefined}
        fallback={
          <>
            <p>Wallet Name: {walletName()}</p>
            <p>Address: {ellipseString(address())}</p>
            <button
              class="btn btn-accent m-1 w-60"
              onClick={() => sendTxn()}
              disabled={activeWallet() === undefined}
              aria-label="Send 0A transaction"
            >
              Send 0A Transaction
            </button>

            <button
              class="btn btn-accent m-1 w-60"
              disabled={confirmedTxn().length === 0}
            >
              <a
                href={getTxUrl(confirmedTxn())}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View transaction"
              >
                View Transaction{confirmedTxn() && `: ${ellipseString(confirmedTxn())}`}
              </a>
            </button>
            <button
              class="btn btn-accent m-1 w-60"
              onClick={() => disconnectWallet()}
              disabled={activeWallet() === undefined}
              aria-label="Disconnect wallet"
            >
              Disconnect Wallet
            </button>
          </>
        }
      >
        <div class="flex flex-col gap-1">
          <For each={Object.values(walletInterfaces)}>
            {(wallet) => (
              <div class="flex gap-1">
                <button
                  class="btn btn-accent w-20"
                  onClick={() => connectWallet(wallet)}
                >
                  {wallet.icon()}
                </button>
                <button
                  class="btn btn-accent w-60"
                  onClick={() => connectWallet(wallet)}
                >
                  {wallet.image()}
                </button>
              </div>
            )}
          </For>
        </div>
      </Show>
      <footer class="flex flex-col justify-center gap-2 p-4">
        <a
          href="https://x.com/silentrhetoric"
          target="_blank"
          class="flex flex-row"
        >
          <svg
            viewBox="0 0 24 24"
            class="h-6 w-6 fill-base-content"
          >
            <g>
              <path d="M14.258 10.152L23.176 0h-2.113l-7.747 8.813L7.133 0H0l9.352 13.328L0 23.973h2.113l8.176-9.309 6.531 9.309h7.133zm-2.895 3.293l-.949-1.328L2.875 1.56h3.246l6.086 8.523.945 1.328 7.91 11.078h-3.246zm0 0"></path>
            </g>
          </svg>
          <p class="ml-2">Made for xGov-49 by @SilentRhetoric</p>
        </a>
        <a
          href="https://github.com/SilentRhetoric/solid-algo-wallets-example"
          aria-label="GitHub repository"
          target="_blank"
          class="flex flex-row"
        >
          <svg
            width="25"
            height="24"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M12.846 0c-6.63 0-12 5.506-12 12.303 0 5.445 3.435 10.043 8.205 11.674.6.107.825-.262.825-.585 0-.292-.015-1.261-.015-2.291-3.015.569-3.795-.754-4.035-1.446-.135-.354-.72-1.446-1.23-1.738-.42-.23-1.02-.8-.015-.815.945-.015 1.62.892 1.845 1.261 1.08 1.86 2.805 1.338 3.495 1.015.105-.8.42-1.338.765-1.645-2.67-.308-5.46-1.37-5.46-6.075 0-1.338.465-2.446 1.23-3.307-.12-.308-.54-1.569.12-3.26 0 0 1.005-.323 3.3 1.26.96-.276 1.98-.415 3-.415s2.04.139 3 .416c2.295-1.6 3.3-1.261 3.3-1.261.66 1.691.24 2.952.12 3.26.765.861 1.23 1.953 1.23 3.307 0 4.721-2.805 5.767-5.475 6.075.435.384.81 1.122.81 2.276 0 1.645-.015 2.968-.015 3.383 0 .323.225.707.825.585a12.047 12.047 0 0 0 5.919-4.489 12.537 12.537 0 0 0 2.256-7.184c0-6.798-5.37-12.304-12-12.304Z"
            />
          </svg>
          <p class="ml-2 flex">Contribute to this open source project</p>
        </a>
        <a
          href="https://algonode.io"
          aria-label="AlgoNode"
          target="_blank"
          class="flex flex-row"
        >
          <img
            src={algonode}
            class="m-[-3px] h-8 w-8"
          />
          <p class="ml-2">Powered by AlgoNode</p>
        </a>
      </footer>
    </div>
  )
}

export default App

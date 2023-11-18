import { getUserBalanceBySecret, getUserReceiptsBySecret } from 'opact-sdk'

self.addEventListener("message", async (event: any) => {
  try {
    const {
      secret,
      currentId,
      storedUtxos,
      storedReceipts,
    } = event.data.input as any;

    const receipts = await getUserReceiptsBySecret(secret, currentId, storedReceipts)
    const {
      lastId,
      treeBalances,
    } = await getUserBalanceBySecret(secret, currentId, storedUtxos)

    self.postMessage(
      {
        type: "done",
        payload: {
          lastId,
          receipts,
          treeBalances
        }
      } as any
    );
  } catch (e) {
    console.warn('[Retry] Compute data error: ', e)

    self.postMessage(
      {
        type: "error",
        payload: {
          e
        }
      } as any
    );
  }
});

export {};

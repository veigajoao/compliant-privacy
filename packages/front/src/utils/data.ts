

import { getPublicArgs } from '@/sdk';
// import { artifactStore } from './artifact-store';
import { createDataWorker } from './data-worker';

export const computeData = async ({
  secret,
  currentId,
  storedUtxos,
}: any): Promise<any> => {
  const { worker, handlers } = createDataWorker()

  try {
    // const zkey = await artifactStore.get('/transaction.zkey')

    const { payload } = await handlers.getData({
      secret,
      currentId,
      storedUtxos,
    }) as any

    if (!payload) {
      throw new Error('We had a problem building your proof.');
    }

    return payload.treeBalances

  } catch (e) {
    console.warn(e)

    if (e instanceof Error) {
      throw new Error(e.message);
    }
  } finally {
    worker.terminate()
  }
}

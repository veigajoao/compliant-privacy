

import { getPublicArgs } from '@/sdk';
import { artifactStore } from './artifact-store';
import { createProofWorker } from './proof-worker';

export const buildProof = async ({
  inputs,
}: any): Promise<any> => {
  const { worker, handlers } = createProofWorker()

  try {
    const zkey = await artifactStore.get('/transaction.zkey')

    const { payload } = await handlers.buildProof({
      zkey,
      payload: inputs,
      verifierUrl: '/transaction.wasm',
    }) as any

    if (!payload) {
      throw new Error('We had a problem building your proof.');
    }

    return getPublicArgs(
      payload.proof,
      payload.publicSignals,
    )

  } catch (e) {
    console.warn(e)

    if (e instanceof Error) {
      throw new Error(e.message);
    }
  } finally {
    worker.terminate()
  }
}

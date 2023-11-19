// @ts-ignore
import createWorker from 'worker-module:../sw/data';

export function createDataWorker() {
  const worker = new createWorker()

  const getData = ({
    secret,
    currentId,
    nullifiers,
    storedUtxos,
    encryptedCommitments,
  }: any) => {
    return new Promise<Blob[]>((resolve, reject) => {
      worker.postMessage({
        input: {
          secret,
          currentId,
          nullifiers,
          storedUtxos,
          encryptedCommitments,
        }
      })

      worker.addEventListener("message", (event: any) => {
        console.log('Worker PostMessage Event', event)

        switch (event.data.type) {
          case "done":
            resolve(event.data)
            break;

          case "error":
            reject(event.data)
            break;
          default:
            break;
        }
      });
    });
  }

  return {
    worker,
    handlers: {
      getData,
    }
  }
}

import { debounce } from "../utils/debounce";
import { groth16 } from 'snarkjs'

export type FileWorkerInput = {
  type: "single_file";
  input: {
    file: File;
    chunkSize: number;
  };
};

export type FileWorkerEventType = MessageEvent<FileWorkerInput>;

export type FileWorkerMessage =
  | {
      type: "done";
      payload: {
        progress: number;
        chunks: Blob[];
      };
    }
  | {
      type: "error";
      payload: {
        error: string;
      };
    };

self.addEventListener("message", async (event: any) => {
  try {
    const { input, wasm, zkey } = event.data.input as any;

    /**
     * When is the first hit of IP on circuit.zkey, vercel returns 502. We retry to continue withdraw
     */
    try {
      const res = await groth16.fullProve(
        input,
        wasm,
        zkey,
      );

      self.postMessage(
        {
          type: "done",
          payload: res
        } as any
      );
    } catch (e) {
      console.warn('[Retry] First full prove error:', e);

      try {
        const res = await groth16.fullProve(
          input,
          wasm,
          zkey,
          {
            debug: debounce((message: string) => {
              self.postMessage({
                type: "progress",
                payload: message
              })

              return message
            }, 100)
          }
        );

        self.postMessage(
          {
            type: "done",
            payload: res
          } as any
        );
      } catch (error) {
        console.warn('[Retry] Building proof error: ', error)

        self.postMessage(
          {
            type: "error",
            payload: {
              error
            }
          } as any
        );
      }
    }
  } catch (error) {
    console.warn('Building proof error: ', error)

    self.postMessage(
      {
        type: "error",
        payload: {
          error
        }
      } as any
    );
  }
});

export {};

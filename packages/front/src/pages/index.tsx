/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable jsdoc/require-jsdoc */
/* eslint-disable jsdoc/require-returns */

import { Actions } from "@/components/form";
import { Header } from "@/components/layout/header";
import { computeInputs, getDepositSoluctionBatch, getRandomWallet } from "@/sdk";
import { Transition } from "@headlessui/react";
import { groth16 } from "snarkjs";

function BackgroundIllustration() {
  return (
    <div className="absolute inset-0 max-w-full max-h-full overflow-hidden">
      <img src="/hero.webp" className="w-full" />
    </div>
  );
}

export function Index() {
  const handle = async () => {
    const wallet = getRandomWallet()

    const batch = await getDepositSoluctionBatch({
      senderWallet: wallet,
      totalRequired: 10,
      selectedToken: 'erc2020',
    });

    const { inputs } = await computeInputs({
      batch,
      wallet,
    });

    const { proof, publicSignals } = await groth16.fullProve(
      inputs,
      './transaction.wasm',
      './transaction.zkey'
    );

    console.log('proof, publicSignals', proof, publicSignals)
  }

  return (
    <div className="relative">
      <BackgroundIllustration />

      <Transition
        show={true}
        enter="transition-opacity duration-1000"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-1000"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <Header />

        <div className="overflow-hidden relative min-h-[100vh] flex items-center justify-center">
          <Actions/>
        </div>
      </Transition>
    </div>
  );
}

export default Index;

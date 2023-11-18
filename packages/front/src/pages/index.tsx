/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable jsdoc/require-jsdoc */
/* eslint-disable jsdoc/require-returns */

import { Button } from "@/components/button";
import { Header } from "@/components/layout/header";
import { Transition } from "@headlessui/react";

function BackgroundIllustration() {
  return (
    <div className="absolute inset-0 max-w-full max-h-full overflow-hidden">
      <img src="/hero.webp" className="w-full" />
    </div>
  );
}

export function Index() {
  const handle = () => {

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
          <Button
            text="fooo"
            onClick={() => handle()}
          />
        </div>
      </Transition>
    </div>
  );
}

export default Index;

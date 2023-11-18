import { Listbox } from "@headlessui/react";
import {
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { Button } from "../button";
import { twMerge } from "tailwind-merge";
import { useOpactContext } from "@/context/opact";
import { Input } from "../input";

export function Deposit() {
  const {
    global,
    sendDeposit
  } = useOpactContext()

  return (
    <div>
      <div>
        <Input
          value={''}
          error={''}
          isValid={true}
          isDisabled={false}
          label="Deposit Amount"
          placeholder="Amount to depoist..."
          onChange={(value) => {}}
        />

        <div
          className="pt-[32px]"
        >
          <Button
            isLoading={global.loadingDeposit}
            disabled={!global.wallet}
            onClick={() => sendDeposit({ amount: 10 })}
            text={'Deposit'}
          />
        </div>
      </div>
    </div>
  );
}

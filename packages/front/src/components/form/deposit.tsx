import { Listbox } from "@headlessui/react";
import {
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { Button } from "../button";
import { twMerge } from "tailwind-merge";
import { useOpactContext } from "@/context/opact";
import { Input } from "../input";
import { useState } from 'react'

export function Deposit() {
  const {
    global,
    sendDeposit
  } = useOpactContext()

  const [value, setValue] = useState('')

  return (
    <div>
      <div>
        <Input
          value={value}
          error={''}
          isValid={true}
          isDisabled={false}
          label="Deposit Amount"
          placeholder="Amount to depoist..."
          onChange={(value) => setValue(value as string)}
        />

        <div
          className="pt-[32px]"
        >
          <Button
            isLoading={global.loadingDeposit}
            disabled={!global.wallet}
            onClick={() => sendDeposit(value)}
            text={'Deposit'}
          />
        </div>
      </div>
    </div>
  );
}

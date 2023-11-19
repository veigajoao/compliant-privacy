import { Listbox } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { Button } from "../button";
import { twMerge } from "tailwind-merge";
import { useOpactContext } from "@/context/opact";
import { Input } from "../input";
import { useState } from "react";
import { SelectToken } from "../index";

export function Deposit() {
  const { global, sendDeposit, walletConnectModal } = useOpactContext();

  const [value, setValue] = useState(0);

  return (
    <div>
      <div className="space-y-6">
        <Input
          value={value}
          error={""}
          isValid={true}
          type="number"
          isDisabled={false}
          label="Deposit Amount"
          placeholder="0,00"
          onChange={(value) => setValue(Number(value))}
        />

        <SelectToken />

        <div className="pt-2">
          <Button
            isLoading={global.loadingDeposit}
            disabled={!global.wallet}
            onClick={() => walletConnectModal.openModal()}
            text={"Deposit"}
          />
        </div>
      </div>
    </div>
  );
}

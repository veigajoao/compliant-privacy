import { Input } from "../input";
import { If } from "@/components/if";
import { useState } from 'react'
import { WithdrawButton } from "./withdraw-button";
import { useOpactContext } from "@/context/opact";

export function Withdraw() {
  const [value, setValue] = useState()
  const [address, setAddress] = useState()

  const {
    sendWithdraw
  } = useOpactContext()

  return (
    <div className="space-y-[24px]">
      <Input
        value={''}
        isDisabled={false}
        error={''}
        isValid={true}
        label="Amount"
        placeholder="0,00"
        onChange={(value) => {}}
      />

      <Input
        value={''}
        error={''}
        isValid={true}
        isDisabled={false}
        label="Select token"
        placeholder="Choose token"
        onChange={(value) => {}}
      />

      <Input
        value={''}
        error={''}
        isValid={true}
        isDisabled={false}
        label="Recipient address"
        placeholder="Address, domain or identity"
        onChange={(value) => {}}
      />

      <div
        className="pt-[16px]"
      >
        <WithdrawButton
          isLoading={false}
          buttonText={'Send Withdraw'}
          isDisabled={false}
          onClick={() => sendWithdraw()}
        />
      </div>
    </div>
  );
}

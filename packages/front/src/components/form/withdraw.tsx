import { Input } from "../input";
import { If } from "@/components/if";
import { useState } from 'react'
import { WithdrawButton } from "./withdraw-button";
import { useOpactContext } from "@/context/opact";
import { Select } from "../select-token";

export function Withdraw() {
  const [value, setValue] = useState('')
  const [address, setAddress] = useState('')

  const {
    global,
    sendWithdraw
  } = useOpactContext()

  return (
    <div className="">
      <Input
        value={value as any}
        isDisabled={false}
        error={''}
        isValid={true}
        label="Amount"
        placeholder="0,00"
        onChange={(value) => setValue(value)}
      />

      <div
        className="pt-[24px]"
      >
        <Input
          value={'0x49D518ee3a4eb585A667076dCdfd6fac5dc0f0bF'}
          isDisabled={true}
          error={''}
          isValid={true}
          label="Address"
          placeholder="Input Address"
        />
      </div>


      <Select

      />

      <div
        className="pt-[32px]"
      >
        <WithdrawButton
          buttonText={'Send Withdraw'}
          isDisabled={!global.wallet}
          isLoading={global.loadingWithdraw}
          onClick={() => sendWithdraw(value)}
        />
      </div>
    </div>
  );
}

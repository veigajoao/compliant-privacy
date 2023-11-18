import { Input } from "../input";
import { If } from "@/components/if";
import { WithdrawButton } from "./withdraw-button";

export function Withdraw() {

  return (
    <div className="space-y-[24px]">
      <Input
        value={''}
        error={''}
        isValid={true}
        isDisabled={false}
        label="Withdrawal ticket"
        placeholder="Paste your withdraw ticket"
        onChange={(value) => {}}
      />

      <Input
        value={''}
        isDisabled={false}
        error={''}
        isValid={true}
        label="Recipient Address"
        placeholder="Wallet Address"
        onChange={(value) => {}}
      />

      <div
        className="pt-[16px]"
      >
        <WithdrawButton
          isLoading={true}
          buttonText={'Send Deposit'}
          isDisabled={false}
          onClick={() => {}}
        />
      </div>
    </div>
  );
}

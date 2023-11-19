import { Input } from "../input";
import { If } from "@/components/if";
import { useState } from "react";
import { WithdrawButton } from "./withdraw-button";
import { useOpactContext } from "@/context/opact";
import { SelectToken } from "../index";

export function Withdraw() {
  const [value, setValue] = useState(0.0);
  const [address, setAddress] = useState();
  const [insufficientBalance, setInsufficientBalance] = useState(false);

  const { sendWithdraw, walletConnectModal, global } = useOpactContext();

  const validateWithdrawAmount = (value: string | number) => {
    setValue(Number(value));

    if (value) {
      setInsufficientBalance(
        value >= global.treeBalances[global.selectedToken.tokenAddress]
      );
    }
  };

  return (
    <div className="space-y-[24px]">
      <Input
        value={value}
        isDisabled={false}
        error={insufficientBalance ? "Insufficient Balance" : ""}
        isValid={true}
        label="Amount"
        type="number"
        placeholder="0,00"
        onChange={(value) => validateWithdrawAmount(value)}
      />

      <SelectToken />

      <Input
        value={""}
        error={""}
        isValid={true}
        isDisabled={false}
        label="Recipient address"
        placeholder="Address, domain or identity"
        onChange={(value) => {}}
      />

      <div className="pt-[16px]">
        <WithdrawButton
          isLoading={false}
          buttonText={"Send Withdraw"}
          isDisabled={false}
          onClick={() => walletConnectModal.openModal()}
        />
      </div>
    </div>
  );
}

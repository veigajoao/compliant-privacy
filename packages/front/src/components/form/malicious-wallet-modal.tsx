import { Dialog } from "@headlessui/react";
import { WarningTriangleIcon } from "../assets/warning-triangle";

interface MaliciousWalletModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onContinue: () => void;
}

export const MaliciousWalletModal = ({
  isOpen,
  onCancel,
  onContinue,
}: MaliciousWalletModalProps) => {
  return (
    <Dialog open={isOpen} onClose={onCancel}>
      <Dialog.Overlay
        onClick={onCancel}
        className="fixed inset-0 bg-[#000000] bg-opacity-[0.70] z-40"
      />
      <Dialog.Panel
        className={
          "bg-[#21262D] flex flex-col items-center rounded-lg py-8 px-6 fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
        }
      >
        <div className="mb-10">
          <WarningTriangleIcon />
        </div>
        <h2 className="text-[28px] text-white font-semibold mb-3  max-w-[352px] text-center">
          Potential malicious activity detected
        </h2>
        <p className="text-base text-[#b8b8b8] mb-8 max-w-[352px]">
          Your transaction was flagged as a possible malicious transaction by
          VaaS. If you perform the transaction, you might face civil and
          criminal sanctions. Would you like to continue?
        </p>
        <button
          onClick={onContinue}
          className="w-[352px] rounded-[12px] bg-[#C12E2A] text-white text-[18px] py-4"
        >
          Continue
        </button>
        <button
          onClick={onCancel}
          className="w-[352px] rounded-[12px] border-1 border-[#1B6DFF]  text-white text-[18px] py-4"
        >
          Cancel
        </button>
      </Dialog.Panel>
    </Dialog>
  );
};

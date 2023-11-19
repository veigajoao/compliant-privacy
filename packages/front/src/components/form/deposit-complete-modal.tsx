import { Dialog } from "@headlessui/react";
import { CheckCircleIcon } from "../assets/check-circle";

interface DepositCompleteModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const DepositCompleteModal = ({
  isOpen,
  setIsOpen,
}: DepositCompleteModalProps) => {
  return (
    <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
      <Dialog.Overlay
        onClick={() => setIsOpen(false)}
        className="fixed inset-0 bg-[#000000] bg-opacity-[0.70] z-40"
      />
      <Dialog.Panel
        className={
          "bg-[#21262D] flex flex-col items-center rounded-lg py-8 px-6 fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
        }
      >
        <div className="mb-10">
          <CheckCircleIcon />
        </div>
        <h2 className="text-[28px] text-white font-semibold mb-10">
          Deposit Complete
        </h2>
        <button
          onClick={() => setIsOpen(false)}
          className="w-[352px] rounded-[12px] bg-[#1B6DFF] text-white text-[18px] py-4"
        >
          Confirm
        </button>
      </Dialog.Panel>
    </Dialog>
  );
};

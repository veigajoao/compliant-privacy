import { availableTokens, useOpactContext } from "@/context/opact";
import { Dialog, Listbox, Transition } from "@headlessui/react";
import {
  CheckIcon,
  ChevronRightIcon,
  ChevronUpDownIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Fragment, useState } from "react";

export const SelectToken = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { global, selectToken } = useOpactContext();

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-[16px]">
        <label
          htmlFor="selectToken"
          className="font-title text-[18px] text-white font-[500]"
        >
          Select Token
        </label>
      </div>

      <button
        onClick={() => setIsOpen(true)}
        className="relative px-[16px] h-[60px] bg-transparent rounded-[8px] text-[#919699] w-full flex items-center justify-between border-[1px] outline-none border-white font-title text-[16px] font-[500] opacity-[0.89] disabled:cursor-not-allowed"
      >
        {global.selectedToken.tokenAddress}
        <ChevronRightIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-6 text-white" />
      </button>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
        <Dialog.Overlay
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-[#000000] bg-opacity-[0.70] z-40"
        />
        <Dialog.Panel className="fixed left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-50 border-[1px] rounded-[12px] border-[#363B42] bg-[#21262D]">
          <div>
            <Dialog.Title className="flex justify-between px-6 py-4 font-title text-[18px] text-white font-[500] border-b-[1px] border-[#363B42]">
              Select Token
              <XMarkIcon
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-[#4c566468] cursor-pointer w-8 text-[#1B6DFF]"
              />
            </Dialog.Title>
          </div>

          <div className="p-6">
            <Dialog.Description className=" text-[#B8B8B8] text-base mb-3">
              Tokens
            </Dialog.Description>

            {availableTokens.map((token) => (
              <button
                onClick={() => {
                  selectToken(token);
                  setIsOpen(false);
                }}
                key={token.tokenAddress}
                className="p-4 bg-[#21262D] hover:bg-[#4c566468] transition rounded-[8px]"
              >
                <p className="mr-[160px]">
                  {token.tokenAddress.substring(0, 10)}...
                  {token.tokenAddress.substring(
                    token.tokenAddress.length - 4,
                    token.tokenAddress.length
                  )}
                </p>
                {!!global.treeBalances && (
                  <p>{global.treeBalances[token.tokenAddress] || ""}</p>
                )}
              </button>
            ))}
          </div>
        </Dialog.Panel>
      </Dialog>
    </div>
  );
};

import { twMerge } from "tailwind-merge";
import { ReceiveIcon } from "../assets/receive";
import { SendIcon } from "../assets/send";
import {
  CheckCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

export const Scan = () => {
  const txsHistory = [
    {
      date: "Sep 10, 2023",
      transactions: [
        {
          deposit: true,
          confirmationHash: "0x4ljhnh...295d625",
          txHash: "0x7ab1db3c6857bb848cf...",
          amount: "+65 ETH",
          isWarning: true,
        },
      ],
    },
    {
      date: "Sep 09, 2023",
      transactions: [
        {
          deposit: true,
          confirmationHash: "0x7ab1db...202c24",
          txHash: "0xacd2ba7bd1b5e1e22d...",
          amount: "+28 ETH",
          isWarning: false,
        },
      ],
    },
    {
      date: "Sep 08, 2023",
      transactions: [
        {
          deposit: true,
          confirmationHash: "0x4ljhnh...295d625",
          txHash: "0x7ab1db3c6857bb848cf...",
          amount: "+65 ETH",
          isWarning: true,
        },
        {
          deposit: false,
          confirmationHash: "0x4ljhnh...295d625",
          txHash: "0x7ab1db3c6857bb848cf...",
          amount: "-12  ETH",
          isWarning: false,
        },
        {
          deposit: false,
          confirmationHash: "0x4ljhnh...295d625",
          txHash: "0x7ab1db3c6857bb848cf...",
          amount: "-12  ETH",
          isWarning: false,
        },
      ],
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-end mb-1">
        <p className="px-[50px] text-sm text-[#b8b8b8]">Transaction Hash</p>
        <p className="px-[50px] text-sm text-[#b8b8b8]">Amount</p>
        <p className="px-[50px] text-sm text-[#b8b8b8]">Flag</p>
      </div>
      <div>
        {txsHistory.map((day) => {
          return (
            <div key={day.date}>
              <p className="text-sm text-[#b8b8b8] mb-2">{day.date}</p>
              {day.transactions.map((tx) => {
                return (
                  <div
                    key={tx.txHash}
                    className="mb-3 flex items-center justify-start px-4 py-3 rounded-[8px] bg-[#21262D]"
                  >
                    <div className="flex items-center justify-center mr-4 w-[38px] h-[38px] rounded-full bg-[#363b42]">
                      {tx.deposit ? <ReceiveIcon /> : <SendIcon />}
                    </div>
                    <div className="flex flex-col space-y-2 mr-[40px]">
                      <p className="text-base text-[#FAFAFA]">
                        {tx.deposit ? "Deposit" : "Withdraw"}
                      </p>
                      <p className="text-sm text-[#B8B8B8]">
                        {tx.confirmationHash}
                      </p>
                    </div>
                    <p className="text-[14px] text-white mr-[40px]">
                      {tx.txHash}
                    </p>
                    <p
                      className={twMerge(
                        "mr-[50px] text-base",
                        tx.deposit && "text-[#38A169]",
                        !tx.deposit && "text-white"
                      )}
                    >
                      {tx.amount}
                    </p>
                    <div
                      className={twMerge(
                        "py-2 px-3 text-white text-sm flex space-x-2 rounded-lg",
                        tx.isWarning && "bg-[#532227]",
                        !tx.isWarning && "bg-[#1A4633]"
                      )}
                    >
                      <p>{tx.isWarning ? "Warning" : "Verified"}</p>
                      {tx.isWarning ? (
                        <InformationCircleIcon className="w-5 h-5 text-white" />
                      ) : (
                        <CheckCircleIcon className="w-5 h-5 text-white" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

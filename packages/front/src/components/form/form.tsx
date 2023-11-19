import { Tab } from "@headlessui/react";
import { Deposit } from './deposit'
import { Withdraw } from "./withdraw";

const classNames = (...classes) => classes.filter(Boolean).join(" ");

export function Actions() {
  const tabs = ["Deposit", "Withdraw"];

  return (
    <div
      className="
        min-w-[500px]
        bg-[#0E1319]
        py-[24px] space-y-[24px]
        my-[240px]
        p-[24px]
        rounded-[12px] border-[1px] border-solid border-[#363B42] mx-auto z-[3] relative
      "
    >
      <Tab.Group
        as="div"
        className="
          w-full
          space-y-[24px]
          flex flex-col items-center
        "
      >
        <Tab.List className="flex w-full justify-center space-x-8">
          {tabs.map((tab, i) => (
            <div
              key={tab}
              className="flex"
            >
              <Tab
                className={({ selected }) =>
                  classNames(
                    'text-[16px] select-none outline-none px-[24px] py-[12px] rounded-[8px]',
                    selected
                      ? "text-white bg-[#1752BA]"
                      : "hover:text-white"
                  )
                }
              >
                {tab}
              </Tab>
            </div>
          ))}
        </Tab.List>

        <Tab.Panels className="w-full px-[12px]">
          <Tab.Panel>
            <Deposit />
          </Tab.Panel>

          <Tab.Panel>
            <Withdraw />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}

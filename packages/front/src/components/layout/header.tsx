import { ButtonSecondary } from "../button-secondary";
import { Arrow } from "@/components/assets/arrow";
import { Container } from "../container";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export function Header() {
  return (
    <header className="relative z-50">
      <nav
        className="w-full absolute"
      >
        <div
          className="bg-[#060A0F] h-[44px] w-full flex items-center justify-center border-b-[2px] border-[#606466] py-[8px]"
        >
          <div className="flex">
            <ExclamationTriangleIcon className="w-[18px] text-[#919699]" />

            <p className="hidden lg:block text-[#919699] text-[16px] text-center font-[600] ml-[8px]">
              This app is in beta. It has not been audited.
            </p>

            <p className="lg:hidden text-bold text-[#919699] text-center ml-[8px]">
              App in beta version. Audit in progress.
            </p>

            <a
              href="https://docs.hideyour.cash/general-information/alpha-version"
              target={`_blank`}
              className="flex group text-bold text-white text-center cursor-pointer text-[14px] leading-[21px] space-x-[8px] ml-[16px]"
            >
              <span>
                Learn more
              </span>


              <Arrow
                className="w-[18px] group-hover:rotate-[45deg] transition-all"
              />
            </a>
          </div>
        </div>

        <Container
          className="
            px-[16px]
            max-w-full
            sm:px-[32px]
            lg:px-[30px]
            xl:px-[60px]
            py-[12px]
            lg:py-[18px]
            flex
            justify-between
            bg-[rgba(16,_20,_24,_0.88)]
            backdrop-blur-[4px]
            lg:bg-[#060A0F]/[0.42]
            lg:backdrop-blur-[6px]
            lg:mb-[8px]

            flex-col space-y-[12px]
            md:flex-row md:space-y-0
          "
        >
          <div className="relative z-10 flex items-center gap-16">
            <a href="/" aria-label="Home">
              <img
                className="h-[32px] w-auto"
                src="./logo.svg"
              />
            </a>
          </div>

          <div className="flex items-center gap-6">
            <ButtonSecondary
              withIcon={true}
              disabled={false}
              isLoading={false}
              onClick={() => {}}
              text="Connect Wallet"
            />
          </div>
        </Container>
      </nav>
    </header>
  );
}
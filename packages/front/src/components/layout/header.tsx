import { ButtonSecondary } from "../button-secondary";
import { Container } from "../container";
import { useOpactContext } from "@/context/opact";

export function Header() {
  const {
    global,
    disconnect,
    createRandomWallet,
  } = useOpactContext()

  const shortenAddress = (address: string, chars = 8): string => {
    if (!address) {
      return "";
    }

    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
  };


  return (
    <header className="relative z-50">
      <nav
        className="w-full absolute"
      >
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
            {global.wallet
              ? (
                <ButtonSecondary
                  withIcon={true}
                  disabled={false}
                  isLoading={false}
                  onClick={() => disconnect()}
                  text={shortenAddress(global.wallet.pubkey)}
                />
              )
              : (
                <ButtonSecondary
                  withIcon={true}
                  disabled={false}
                  isLoading={false}
                  onClick={() => createRandomWallet()}
                  text="Generate Random Wallet"
                />
              )
            }
          </div>
        </Container>
      </nav>
    </header>
  );
}

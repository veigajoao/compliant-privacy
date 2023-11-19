import { twMerge } from "tailwind-merge";
import { Spinner } from "./spinner";
import { If } from "./if";

export interface ButtonInterface {
  text: string;
  disabled?: boolean;
  isLoading?: boolean;
  onClick?: () => void;
  type?: any;
}

export const Button = ({
  text,
  disabled = false,
  isLoading = false,
  type = 'button',
  onClick = () => {},
}: ButtonInterface) => {
  return (
    <button
      type={type}
      disabled={!!disabled}
      onClick={() => onClick()}
      className={twMerge(`
        shrink-0
        text-white w-full relative overflow-hidden cursor-pointer
        inline-flex items-center justify-center h-[56px] rounded-[12px]
        disabled:cursor-not-allowed disabled:bg-[#363B42] disabled:opacity-[0.6] bg-[#1A92FF]
      `, !disabled && '')}
    >

        <If condition={!isLoading} fallback={(<Spinner />) as any}>
        <span className="relative z-[2] text-[18px] text-[white]">
        { text }
      </span>
        </If>
    </button>
  );
};

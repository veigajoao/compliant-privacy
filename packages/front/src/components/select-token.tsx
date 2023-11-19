export const Select = () => {
  return (
    <div
      className="flex flex-col pt-8"
    >
      <div className="flex items-center justify-between">
        <span className="font-title text-[16px] text-[#FAFAFA] font-[500]">
          Select Token
        </span>
      </div>

      <div
        className="
          mt-4
          min-h-[56px] w-full rounded-[8px] bg-[#21262D]
          flex items-center p-4 opacity-80 cursor-not-allowed space-x-4
        "
      >
        <div>
          <img
            src="/eth.png"
          />
        </div>

        <div>
          <span
            className="text-[18px] text-white"
          >
            KERRY TOKEN
          </span>
        </div>
      </div>
    </div>
  )
}

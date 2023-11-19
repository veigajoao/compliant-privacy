import { default as axios } from "axios";

export const getAmlAnalysisMock = async (address: string): Promise<boolean> => {
  return true;
};

export const getAmlAnalysis = async (address: string): Promise<boolean> => {
  const { data } = await axios.post(
    "https://api.vaas.live/v1/wallet-screening",
    {
      address,
    },
    {
      headers: {
        Authorization:
          "Basic NjU1NjgzOTk3ZjViNjkwMGIxMzRlZTZiOlZ4WnplTTdYbjMyQmxvN0ZUMmt6c0ZLTGNZWVRkTXFrb3RiTjd3akFBNDlTT1JYdnVZN2FDc05kQlJHMVp3SlhNekVMT1RWWXBySEU5S0grTDhvWVhRPT0=",
      },
    }
  );
  return data.decision != "DENIED";
};

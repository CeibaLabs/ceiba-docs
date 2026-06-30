import localFont from "next/font/local";

export const inter = localFont({
  src: [
    {
      path: "../../public/fonts/inter/Inter_18pt-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/inter/Inter_18pt-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/inter/Inter_18pt-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--ceiba-font-sans",
  display: "swap",
});

export const plusJakartaSans = localFont({
  src: [
    {
      path: "../../public/fonts/plus-jakarta-sans/PlusJakartaSans-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--ceiba-font-display",
  display: "swap",
});

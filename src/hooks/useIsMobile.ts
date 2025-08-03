import { useMediaQuery } from "@mantine/hooks";

export const useIsMobile = () => {
  const isMobile = useMediaQuery("(max-width: 630px)");

  return isMobile;
};

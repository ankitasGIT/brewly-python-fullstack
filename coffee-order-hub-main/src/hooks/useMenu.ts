import { useQuery } from "@tanstack/react-query";
import { fetchMenu } from "@/api/menuApi";

export function useMenu() {
  return useQuery({
    queryKey: ["menu"],
    queryFn: fetchMenu,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

import { useQuery } from "@tanstack/react-query";
import { fetcher } from "../utils/fetcher";

export const useMe = () => {
  return useQuery(["me"], async () => fetcher("/api/confer/me"));
};

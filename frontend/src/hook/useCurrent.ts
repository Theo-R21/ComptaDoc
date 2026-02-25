import { createContext, useContext } from "react";
import {UserInfoModel, UserModel} from "@/src/models/user/user.model";


export type CurrentUserContextType = {
  user: UserInfoModel | null;
  refreshCurrentUser: () => void;
  logout: () => void;
};

export const CurrentUserContext = createContext<CurrentUserContextType>({
  user: null,
  refreshCurrentUser: () => {},
  logout: () => {},
});

export function useCurrentUser() {
  return useContext(CurrentUserContext);
}

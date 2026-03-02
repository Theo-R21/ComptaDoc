import { createContext, useContext } from "react";
import {UserInfoModel, UserModel} from "@/src/models/user/user.model";


export type CurrentUserContextType = {
  user: UserInfoModel | null;
  refreshCurrentUser: () => Promise<void>;
  logout: () => void;
};

export const CurrentUserContext = createContext<CurrentUserContextType>({
    user: null,
    refreshCurrentUser: () => Promise.resolve(),
    logout: () => {},
});

export function useCurrentUser() {
  return useContext(CurrentUserContext);
}

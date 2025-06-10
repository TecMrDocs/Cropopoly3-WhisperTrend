// core/web/src/utils/api/user.ts
import { get, post } from "../methods";
import axios from "axios";
import { API_URL} from "../constants";

export interface User {
  name: string;
  last_name: string;
  email: string;
  phone: string;
  position: string;
  password: string;
  plan: string;
  business_name: string;
  industry: string;
  company_size: string;
  scope: string;
  locations: string;
  num_branches: string;
}

export interface UserCredentials {
  email: string;
  password: string;
}

export default {
  user: {
    check: (): Promise<void> => {
      return get("auth/check", true)
    }, 

    register: (
      user: User
    ): Promise<void> => {
      return post("auth/register", user, false)
    }, 

    verifyMfa: (payload: { code: string }): Promise<{ token: string }> => {
      const tempToken = localStorage.getItem("mfa_token") || "";
      return axios
        .post(
          `${API_URL}auth/mfa`,
          payload,
          {
            headers: { "mfa-token": tempToken }
          }
        )
        .then(({ data }) => data);
    },

    signIn: (
      user_credentials: UserCredentials
    ): Promise<{mfa_token: string}> => {
      return post("auth/signin", user_credentials, false)
    }
  }
}
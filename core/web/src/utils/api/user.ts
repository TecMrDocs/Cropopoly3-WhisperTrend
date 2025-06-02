import { get, post } from "../methods";



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

    signIn: (
      user_credentials: UserCredentials
    ): Promise<{token: string}> => {
      return post("auth/signin", user_credentials, false)
    }
  }
}
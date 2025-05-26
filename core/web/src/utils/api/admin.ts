import { get, post } from "../methods";


export interface Credentials {
  token: string;
}


export interface Admin {
  email: string;
  password: string;
}

export default {
  admin: {
    loginAdmin: (
      email: string, 
      password: string,

    ): Promise<Credentials> => {
      return post('/auth/admin/login', {email, password}, false);
    }, 

    verifyAdmin: (): Promise<Admin> => {
      return get('/auth/admin/verify', false);
    }
  }
}
//core/web/src/utils/auth.ts
interface Config {
  withCredentials: boolean;
  headers: {
    token: string;
  };
}

export function getConfig(): Config {
  const token = localStorage.getItem('token');
  return {
    withCredentials: true,
    headers: {
      token: token || "",
    }
  }
}
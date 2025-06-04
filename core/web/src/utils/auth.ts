interface Config {
  withCredentials: boolean;
  headers: {
    Authorization: string;
  };
}

export function getConfig(): Config {
  return {
    withCredentials: true,
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    }
  }
}
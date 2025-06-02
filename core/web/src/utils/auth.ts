interface Config {
  withCredentials: boolean;
  headers: {
<<<<<<< HEAD
    Authorization: string;
=======
    token: string;
>>>>>>> main
  };
}

export function getConfig(): Config {
<<<<<<< HEAD
  return {
    withCredentials: true,
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
=======
  const token = localStorage.getItem('token');
  return {
    withCredentials: true,
    headers: {
      token: token || "",
>>>>>>> main
    }
  }
}
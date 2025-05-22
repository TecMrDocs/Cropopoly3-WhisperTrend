const SERVER_PROTOCOL = import.meta.env.VITE_APP_SERVER_PROTOCOL || "http";
const SERVER_PORT = import.meta.env.VITE_APP_SERVER_PORT || "5173";
const SERVER_HOSTNAME = import.meta.env.VITE_APP_SERVER_HOST || "localhost";
let SERVER_HOST = `${SERVER_HOSTNAME}:${SERVER_PORT}`;


export const API_ROUTE = import.meta.env.VITE_APP_API_ROUTE || "api/v1";
export const API_URL = `${SERVER_PROTOCOL}://${SERVER_HOST}/${API_ROUTE}`;
export const SERVER = `${SERVER_PROTOCOL}://${SERVER_HOST}`;
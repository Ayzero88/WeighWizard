const host = window.location.hostname;
const secure = window.location.protocol === "https:";

export const BaseUrl = `${secure ? "https" : "http"}://${host}:8080`;
export const WsUrl = `${secure ? "wss" : "ws"}://${host}:8080/ws/weight`;
import Cookies from "js-cookie";

export const setCookie = (name: string, value: string, days: number): void => {
  Cookies.set(name, value, { expires: days, path: "/" });
};

export const getCookie = (name: string): string | null => {
  return Cookies.get(name) || null;
};

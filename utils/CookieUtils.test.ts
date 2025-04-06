import Cookies from 'js-cookie';
import { setCookie, getCookie } from './CookieUtils';

// Mock the js-cookie library
jest.mock('js-cookie', () => ({
  set: jest.fn(),
  get: jest.fn(),
}));

// Type cast the mocked functions for better type checking in tests
const mockCookiesSet = Cookies.set as jest.Mock;
const mockCookiesGet = Cookies.get as jest.Mock;

describe('CookieUtils', () => {
  // Clear mocks before each test to ensure isolation
  beforeEach(() => {
    mockCookiesSet.mockClear();
    mockCookiesGet.mockClear();
  });

  describe('setCookie', () => {
    it('should call Cookies.set with the correct parameters', () => {
      const name = 'testCookie';
      const value = 'testValue';
      const days = 7;

      setCookie(name, value, days);

      // Verify that Cookies.set was called once
      expect(mockCookiesSet).toHaveBeenCalledTimes(1);
      // Verify that Cookies.set was called with the expected arguments
      expect(mockCookiesSet).toHaveBeenCalledWith(name, value, { expires: days, path: '/' });
    });
  });

  describe('getCookie', () => {
    it('should call Cookies.get with the correct name', () => {
      const name = 'myCookie';
      getCookie(name);

      // Verify that Cookies.get was called once
      expect(mockCookiesGet).toHaveBeenCalledTimes(1);
      // Verify that Cookies.get was called with the expected name
      expect(mockCookiesGet).toHaveBeenCalledWith(name);
    });

    it('should return the value from Cookies.get if the cookie exists', () => {
      const name = 'existingCookie';
      const expectedValue = 'cookieData';
      // Configure the mock to return a value for this test
      mockCookiesGet.mockReturnValue(expectedValue);

      const result = getCookie(name);

      expect(result).toBe(expectedValue);
    });

    it('should return null if Cookies.get returns undefined (cookie does not exist)', () => {
      const name = 'nonExistentCookie';
      // Configure the mock to return undefined (the default behavior of Cookies.get for missing cookies)
      mockCookiesGet.mockReturnValue(undefined);

      const result = getCookie(name);

      expect(result).toBeNull();
    });
  });
});

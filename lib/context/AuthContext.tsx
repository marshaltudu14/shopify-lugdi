// lib/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useApolloClient } from "@apollo/client";
import { gql } from "@apollo/client";
import { User, LoginCredentials, SignupCredentials } from "@/lib/types/auth";

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  googleLogin: (token: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  verifyEmail: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOGIN_MUTATION = gql`
  mutation CustomerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

const CUSTOMER_QUERY = gql`
  query Customer($accessToken: String!) {
    customer(customerAccessToken: $accessToken) {
      id
      email
      firstName
      lastName
      emailVerified
    }
  }
`;

const SIGNUP_MUTATION = gql`
  mutation CustomerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
        email
        firstName
        lastName
        emailVerified
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const client = useApolloClient();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    try {
      const { data } = await client.mutate({
        mutation: LOGIN_MUTATION,
        variables: { input: credentials },
      });

      if (data.customerAccessTokenCreate.customerUserErrors.length > 0) {
        throw new Error(
          data.customerAccessTokenCreate.customerUserErrors[0].message
        );
      }

      const { data: customerData } = await client.query({
        query: CUSTOMER_QUERY,
        variables: {
          accessToken:
            data.customerAccessTokenCreate.customerAccessToken.accessToken,
        },
      });

      const userData = {
        ...customerData.customer,
        accessToken:
          data.customerAccessTokenCreate.customerAccessToken.accessToken,
      };
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (credentials: SignupCredentials) => {
    setLoading(true);
    try {
      const { data } = await client.mutate({
        mutation: SIGNUP_MUTATION,
        variables: { input: credentials },
      });

      if (data.customerCreate.customerUserErrors.length > 0) {
        throw new Error(data.customerCreate.customerUserErrors[0].message);
      }

      const userData = data.customerCreate.customer;
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));

      // Send verification email
      await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: credentials.email, userId: userData.id }),
      });
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (token: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) throw new Error("Google login failed");

      const data = await response.json();
      setUser(data.customer);
      localStorage.setItem("user", JSON.stringify(data.customer));
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (token: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) throw new Error("Email verification failed");

      const data = await response.json();
      setUser(data.customer);
      localStorage.setItem("user", JSON.stringify(data.customer));
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{ user, login, signup, googleLogin, logout, loading, verifyEmail }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

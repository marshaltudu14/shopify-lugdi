"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function Account() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch(`/api/auth/check-auth`);
        const data = await response.json();
        setIsAuthenticated(data.authenticated);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    }
    fetchUser();
  }, []);

  const handleLogout = () => {
    try {
      setIsLoggingOut(true);
      window.location.href = "/api/auth/logout";
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    if (!isLoggingOut) {
      async function checkAuthAfterLogout() {
        try {
          const response = await fetch(`/api/auth/check-auth`);
          const data = await response.json();
          setIsAuthenticated(data.authenticated);
        } catch (error) {
          console.error("Error checking auth after logout:", error);
        }
      }
      checkAuthAfterLogout();
    }
  }, [isLoggingOut]);

  return (
    <>
      {isAuthenticated ? (
        <div className="min-h-screen flex items-center justify-center">
          <Button onClick={handleLogout} disabled={isLoggingOut}>
            {isLoggingOut ? (
              <div className="flex items-center justify-center gap-1">
                <Loader2 className="animate-spin" />
                <p>Logging out...</p>
              </div>
            ) : (
              "Logout"
            )}
          </Button>
        </div>
      ) : (
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin" />
        </div>
      )}
    </>
  );
}

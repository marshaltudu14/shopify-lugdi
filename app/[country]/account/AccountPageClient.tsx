"use client";

import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface Order {
  id: string;
  name: string;
  createdAt: string;
  cancelledAt: string | null;
  cancelReason: string | null;
  currencyCode: string;
  financialStatus: string;
  processedAt: string;
  totalPrice: {
    amount: string;
    currencyCode: string;
  };
}

interface CustomerData {
  id: string;
  displayName: string;
  emailAddress: {
    emailAddress: string;
  };
  orders: Order[];
  pageInfo?: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string;
    endCursor: string;
  };
}

export default function AccountPageClient() {
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(1);
  const [sortKey, setSortKey] = useState("CREATED_AT");
  const [reverse, setReverse] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [afterCursor, setAfterCursor] = useState<string | null>(null);
  const [beforeCursor, setBeforeCursor] = useState<string | null>(null);

  // Check authentication status
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

  // Fetch customer data with pagination, sort, and search
  useEffect(() => {
    if (isAuthenticated) {
      fetchCustomerData();
    }
  }, [isAuthenticated, currentPage, sortKey, reverse, searchQuery]);

  const fetchCustomerData = async () => {
    try {
      const response = await fetch("/api/customer/info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first: ordersPerPage,
          after: afterCursor,
          before: beforeCursor,
          sortKey,
          reverse,
          query: searchQuery || undefined,
        }),
      });
      const data = await response.json();
      setCustomer({
        ...data.customer,
        orders: data.customer.orders.edges.map((edge: any) => edge.node),
        pageInfo: data.customer.orders.pageInfo,
      });
      setAfterCursor(data.customer.orders.pageInfo.endCursor);
      setBeforeCursor(data.customer.orders.pageInfo.startCursor);
    } catch (error) {
      console.error("Error fetching customer data:", error);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      window.location.href = "/api/auth/logout";
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleSortChange = (value: string) => {
    setSortKey(value);
    setCurrentPage(1);
    setAfterCursor(null);
    setBeforeCursor(null);
  };

  const handleReverseToggle = () => {
    setReverse(!reverse);
    setCurrentPage(1);
    setAfterCursor(null);
    setBeforeCursor(null);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
    setAfterCursor(null);
    setBeforeCursor(null);
  };

  const handlePageChange = (direction: "next" | "prev") => {
    if (direction === "next" && customer?.pageInfo?.hasNextPage) {
      setCurrentPage((prev) => prev + 1);
      setBeforeCursor(null);
    } else if (direction === "prev" && customer?.pageInfo?.hasPreviousPage) {
      setCurrentPage((prev) => prev - 1);
      setAfterCursor(null);
    }
  };

  return (
    <>
      {isAuthenticated && customer !== null ? (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          {/* User Information */}
          <section className="mb-8">
            <div className="text-center">
              <p className="text-lg font-semibold">
                Welcome, {customer?.displayName || "User"}
              </p>
              <span className="text-gray-600">
                {customer.emailAddress?.emailAddress}
              </span>
            </div>
          </section>

          {/* Search and Sort Controls */}
          <section className="w-full max-w-2xl mb-8">
            <div className="flex gap-4 flex-col sm:flex-row">
              <Input
                placeholder="Search orders by name or item..."
                value={searchQuery}
                onChange={handleSearch}
                className="flex-1"
              />
              <Select onValueChange={handleSortChange} defaultValue={sortKey}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CREATED_AT">Created At</SelectItem>
                  <SelectItem value="ID">ID</SelectItem>
                  <SelectItem value="ORDER_NUMBER">Order Number</SelectItem>
                  <SelectItem value="PROCESSED_AT">Processed At</SelectItem>
                  <SelectItem value="TOTAL_PRICE">Total Price</SelectItem>
                  <SelectItem value="UPDATED_AT">Updated At</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleReverseToggle}>
                {reverse ? "↓ Desc" : "↑ Asc"}
              </Button>
            </div>
          </section>

          {/* Order Section */}
          <section className="w-full max-w-4xl">
            <h2 className="text-xl font-semibold mb-4">Your Order History</h2>
            {customer.orders.length > 0 ? (
              <div className="space-y-4">
                {customer.orders.map((order) => (
                  <div
                    key={order.id}
                    className="border p-4 rounded-lg shadow-sm"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <p className="font-medium">Order {order.name}</p>
                        <p className="text-sm text-gray-600">
                          Created:{" "}
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        {order.cancelledAt && (
                          <p className="text-sm text-red-600">
                            Cancelled:{" "}
                            {new Date(order.cancelledAt).toLocaleDateString()} (
                            {order.cancelReason})
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm">
                          Status: {order.financialStatus}
                        </p>
                        <p className="text-sm">
                          Processed:{" "}
                          {new Date(order.processedAt).toLocaleDateString()}
                        </p>
                        <p className="font-medium">
                          Total: {order.totalPrice.amount}{" "}
                          {order.totalPrice.currencyCode}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No orders found.</p>
            )}

            {/* Pagination */}
            {(customer.pageInfo?.hasNextPage ||
              customer.pageInfo?.hasPreviousPage) && (
              <Pagination className="mt-6">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange("prev")}
                      className={
                        !customer.pageInfo?.hasPreviousPage
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink isActive>{currentPage}</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange("next")}
                      className={
                        !customer.pageInfo?.hasNextPage
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </section>

          {/* Logout Button */}
          <section className="mt-8">
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
          </section>
        </div>
      ) : (
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin" />
        </div>
      )}
    </>
  );
}

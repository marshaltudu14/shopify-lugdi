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
import { Loader2, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

interface LineItem {
  id: string;
  name: string;
  quantity: number;
  image: {
    url: string;
    altText: string | null;
  };
  price: {
    amount: string;
    currencyCode: string;
  };
  totalDiscount: {
    amount: string;
    currencyCode: string;
  };
  totalPrice: {
    amount: string;
    currencyCode: string;
  };
  variantOptions: Array<{
    name: string;
    value: string;
  }>;
}

interface Fulfillment {
  id: string;
  estimatedDeliveryAt: string | null;
  latestShipmentStatus: string | null;
  status: string;
  fulfillmentLineItems: {
    edges: Array<{
      node: {
        id: string;
        lineItem: LineItem;
        quantity: number;
      };
    }>;
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor: string;
      endCursor: string;
    };
  };
  trackingInformation: Array<{
    company: string | null;
    number: string | null;
    url: string | null;
  }>;
  updatedAt: string;
}

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
  lineItems: {
    edges: Array<{
      node: LineItem;
    }>;
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor: string;
      endCursor: string;
    };
  };
  fulfillments: {
    edges: Array<{
      node: Fulfillment;
    }>;
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor: string;
      endCursor: string;
    };
  };
}

interface CustomerData {
  id: string;
  displayName: string;
  emailAddress: {
    emailAddress: string;
    marketingState: string;
  };
  orders: {
    edges: Array<{
      node: Order;
    }>;
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor: string;
      endCursor: string;
    };
  };
}

const financialStatusMap: Record<string, string> = {
  AUTHORIZED: "Authorized",
  EXPIRED: "Expired",
  PAID: "Paid",
  PARTIALLY_PAID: "Partially Paid",
  PARTIALLY_REFUNDED: "Partially Refunded",
  PENDING: "Pending",
  REFUNDED: "Refunded",
  VOIDED: "Voided",
};

const cancelReasonMap: Record<string, string> = {
  CUSTOMER: "Customer Request",
  DECLINED: "Payment Declined",
  FRAUD: "Fraudulent Order",
  INVENTORY: "Insufficient Inventory",
  OTHER: "Other Reason",
  STAFF: "Staff Error",
};

const fulfillmentStatusMap: Record<string, string> = {
  FULFILLED: "Fulfilled",
  IN_PROGRESS: "In Progress",
  ON_HOLD: "On Hold",
  OPEN: "Open",
  PARTIALLY_FULFILLED: "Partially Fulfilled",
  PENDING_FULFILLMENT: "Pending",
  RESTOCKED: "Restocked",
  SCHEDULED: "Scheduled",
};

export default function AccountPageClient() {
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(5);
  const [sortKey, setSortKey] = useState("CREATED_AT");
  const [reverse, setReverse] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [afterCursor, setAfterCursor] = useState<string | null>(null);
  const [beforeCursor, setBeforeCursor] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>(
    {}
  );
  const [loadingMoreItems, setLoadingMoreItems] = useState<
    Record<string, boolean>
  >({});
  const [loadingMoreFulfillments, setLoadingMoreFulfillments] = useState<
    Record<string, boolean>
  >({});

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
          lineItemsFirst: 3,
          fulfillmentsFirst: 1,
        }),
      });
      const data = await response.json();
      setCustomer(data.customer);
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
    if (direction === "next" && customer?.orders?.pageInfo?.hasNextPage) {
      setCurrentPage((prev) => prev + 1);
      setBeforeCursor(null);
    } else if (
      direction === "prev" &&
      customer?.orders?.pageInfo?.hasPreviousPage
    ) {
      setCurrentPage((prev) => prev - 1);
      setAfterCursor(null);
    }
  };

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const loadMoreLineItems = async (orderId: string, cursor: string) => {
    try {
      setLoadingMoreItems((prev) => ({ ...prev, [orderId]: true }));

      const response = await fetch("/api/customer/info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first: ordersPerPage,
          sortKey,
          reverse,
          query: searchQuery || undefined,
          lineItemsFirst: 10, // Load more items
          fulfillmentsFirst: 1,
        }),
      });

      const data = await response.json();

      // Update the specific order's line items
      setCustomer((prev) => {
        if (!prev) return null;

        const updatedOrders = prev.orders.edges.map((edge) => {
          if (edge.node.id === orderId) {
            return {
              ...edge,
              node: {
                ...edge.node,
                lineItems:
                  data.customer.orders.edges.find(
                    (e: any) => e.node.id === orderId
                  )?.node.lineItems || edge.node.lineItems,
              },
            };
          }
          return edge;
        });

        return {
          ...prev,
          orders: {
            ...prev.orders,
            edges: updatedOrders,
          },
        };
      });
    } catch (error) {
      console.error("Error loading more line items:", error);
    } finally {
      setLoadingMoreItems((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const loadMoreFulfillments = async (orderId: string, cursor: string) => {
    try {
      setLoadingMoreFulfillments((prev) => ({ ...prev, [orderId]: true }));

      const response = await fetch("/api/customer/info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first: ordersPerPage,
          sortKey,
          reverse,
          query: searchQuery || undefined,
          lineItemsFirst: 3,
          fulfillmentsFirst: 5, // Load more fulfillments
        }),
      });

      const data = await response.json();

      // Update the specific order's fulfillments
      setCustomer((prev) => {
        if (!prev) return null;

        const updatedOrders = prev.orders.edges.map((edge) => {
          if (edge.node.id === orderId) {
            return {
              ...edge,
              node: {
                ...edge.node,
                fulfillments:
                  data.customer.orders.edges.find(
                    (e: any) => e.node.id === orderId
                  )?.node.fulfillments || edge.node.fulfillments,
              },
            };
          }
          return edge;
        });

        return {
          ...prev,
          orders: {
            ...prev.orders,
            edges: updatedOrders,
          },
        };
      });
    } catch (error) {
      console.error("Error loading more fulfillments:", error);
    } finally {
      setLoadingMoreFulfillments((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: string, currencyCode: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
    }).format(parseFloat(amount));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && customer !== null ? (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* User Information */}
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome, {customer?.displayName || "User"}
                </h1>
                <p className="text-gray-600 mt-1">
                  {customer.emailAddress?.emailAddress}
                </p>
              </div>
              <Button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="mt-4 md:mt-0"
                variant="outline"
              >
                {isLoggingOut ? (
                  <div className="flex items-center justify-center gap-1">
                    <Loader2 className="animate-spin h-4 w-4" />
                    <p>Logging out...</p>
                  </div>
                ) : (
                  "Logout"
                )}
              </Button>
            </div>
          </div>

          {/* Search and Sort Controls */}
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Order History
            </h2>
            <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:space-x-4">
              <Input
                placeholder="Search orders by name or item..."
                value={searchQuery}
                onChange={handleSearch}
                className="flex-1"
              />
              <div className="flex space-x-2">
                <Select onValueChange={handleSortChange} defaultValue={sortKey}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CREATED_AT">Order Date</SelectItem>
                    <SelectItem value="PROCESSED_AT">Processed Date</SelectItem>
                    <SelectItem value="TOTAL_PRICE">Total Price</SelectItem>
                    <SelectItem value="UPDATED_AT">Updated Date</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleReverseToggle} variant="outline">
                  {reverse ? "Newest First" : "Oldest First"}
                </Button>
              </div>
            </div>
          </div>

          {/* Order List */}
          <div className="space-y-4">
            {customer.orders.edges.length > 0 ? (
              customer.orders.edges.map(({ node: order }) => (
                <div
                  key={order.id}
                  className="bg-white shadow rounded-lg overflow-hidden"
                >
                  {/* Order Summary */}
                  <div
                    className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleOrderExpansion(order.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Placed on {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">
                          {formatCurrency(
                            order.totalPrice.amount,
                            order.totalPrice.currencyCode
                          )}
                        </p>
                        <div className="flex items-center justify-end mt-1">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              order.cancelledAt
                                ? "bg-red-100 text-red-800"
                                : order.financialStatus === "PAID"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {order.cancelledAt
                              ? "Cancelled"
                              : financialStatusMap[order.financialStatus] ||
                                order.financialStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <div>
                        {order.cancelledAt && (
                          <p className="text-sm text-red-600">
                            Cancelled on {formatDate(order.cancelledAt)} •
                            Reason:{" "}
                            {cancelReasonMap[order.cancelReason || "OTHER"] ||
                              "Not specified"}
                          </p>
                        )}
                      </div>
                      <ChevronDown
                        className={`h-5 w-5 text-gray-500 transition-transform ${
                          expandedOrders[order.id] ? "transform rotate-180" : ""
                        }`}
                      />
                    </div>
                  </div>

                  {/* Expanded Order Details */}
                  {expandedOrders[order.id] && (
                    <div className="border-t border-gray-200 p-6">
                      {/* Order Line Items */}
                      <div className="mb-8">
                        <h4 className="text-md font-medium text-gray-900 mb-4">
                          Items ({order.lineItems.edges.length})
                        </h4>
                        <div className="space-y-4">
                          {order.lineItems.edges.map(({ node: item }) => (
                            <div
                              key={item.id}
                              className="flex border-b border-gray-100 pb-4"
                            >
                              <div className="flex-shrink-0 h-20 w-20 rounded-md overflow-hidden">
                                <img
                                  src={
                                    item.image?.url ||
                                    "/placeholder-product.jpg"
                                  }
                                  alt={item.image?.altText || item.name}
                                  className="h-full w-full object-cover object-center"
                                />
                              </div>
                              <div className="ml-4 flex-1 flex flex-col">
                                <div>
                                  <h5 className="text-sm font-medium text-gray-900">
                                    {item.name}
                                  </h5>
                                  {item.variantOptions &&
                                    item.variantOptions.length > 0 && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        {item.variantOptions
                                          .map(
                                            (opt) => `${opt.name}: ${opt.value}`
                                          )
                                          .join(", ")}
                                      </p>
                                    )}
                                </div>
                                <div className="flex-1 flex items-end justify-between">
                                  <p className="text-sm text-gray-500">
                                    Qty: {item.quantity}
                                  </p>
                                  <div className="text-right">
                                    {parseFloat(item.totalDiscount.amount) >
                                      0 && (
                                      <p className="text-xs text-gray-500 line-through">
                                        {formatCurrency(
                                          item.price.amount,
                                          item.price.currencyCode
                                        )}
                                      </p>
                                    )}
                                    <p className="text-sm font-medium text-gray-900">
                                      {formatCurrency(
                                        item.totalPrice.amount,
                                        item.totalPrice.currencyCode
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        {order.lineItems.pageInfo.hasNextPage && (
                          <div className="mt-4 text-center">
                            <Button
                              variant="outline"
                              onClick={() =>
                                loadMoreLineItems(
                                  order.id,
                                  order.lineItems.pageInfo.endCursor
                                )
                              }
                              disabled={loadingMoreItems[order.id]}
                            >
                              {loadingMoreItems[order.id] ? (
                                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                              ) : (
                                <ChevronDown className="h-4 w-4 mr-2" />
                              )}
                              View More Items
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Order Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                          <h4 className="text-md font-medium text-gray-900 mb-4">
                            Order Summary
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <p className="text-sm text-gray-600">Subtotal</p>
                              <p className="text-sm text-gray-900">
                                {formatCurrency(
                                  order.totalPrice.amount,
                                  order.totalPrice.currencyCode
                                )}
                              </p>
                            </div>
                            <div className="flex justify-between">
                              <p className="text-sm text-gray-600">Status</p>
                              <p className="text-sm text-gray-900">
                                {financialStatusMap[order.financialStatus] ||
                                  order.financialStatus}
                              </p>
                            </div>
                            <div className="flex justify-between">
                              <p className="text-sm text-gray-600">
                                Order Date
                              </p>
                              <p className="text-sm text-gray-900">
                                {formatDate(order.createdAt)}
                              </p>
                            </div>
                            <div className="flex justify-between">
                              <p className="text-sm text-gray-600">Processed</p>
                              <p className="text-sm text-gray-900">
                                {formatDate(order.processedAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-md font-medium text-gray-900 mb-4">
                            Shipping Information
                          </h4>
                          {order.fulfillments.edges.length > 0 ? (
                            <div className="space-y-4">
                              {order.fulfillments.edges.map(
                                ({ node: fulfillment }) => (
                                  <div
                                    key={fulfillment.id}
                                    className="border rounded-lg p-4"
                                  >
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <p className="text-sm font-medium">
                                          {fulfillmentStatusMap[
                                            fulfillment.status
                                          ] || fulfillment.status}
                                        </p>
                                        {fulfillment.estimatedDeliveryAt && (
                                          <p className="text-xs text-gray-500 mt-1">
                                            Estimated delivery:{" "}
                                            {formatDate(
                                              fulfillment.estimatedDeliveryAt
                                            )}
                                          </p>
                                        )}
                                      </div>
                                      {fulfillment.trackingInformation &&
                                        fulfillment.trackingInformation.length >
                                          0 && (
                                          <div className="text-right">
                                            {fulfillment.trackingInformation.map(
                                              (tracking, idx) => (
                                                <div key={idx}>
                                                  {tracking.url ? (
                                                    <Link
                                                      href={tracking.url}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                    >
                                                      <Button
                                                        variant="link"
                                                        className="text-sm p-0 h-auto"
                                                      >
                                                        Track Package{" "}
                                                        <ExternalLink className="h-3 w-3 ml-1" />
                                                      </Button>
                                                    </Link>
                                                  ) : (
                                                    <p className="text-xs text-gray-500">
                                                      Tracking #:{" "}
                                                      {tracking.number}
                                                    </p>
                                                  )}
                                                </div>
                                              )
                                            )}
                                          </div>
                                        )}
                                    </div>
                                  </div>
                                )
                              )}
                              {order.fulfillments.pageInfo.hasNextPage && (
                                <div className="text-center">
                                  <Button
                                    variant="outline"
                                    onClick={() =>
                                      loadMoreFulfillments(
                                        order.id,
                                        order.fulfillments.pageInfo.endCursor
                                      )
                                    }
                                    disabled={loadingMoreFulfillments[order.id]}
                                  >
                                    {loadingMoreFulfillments[order.id] ? (
                                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4 mr-2" />
                                    )}
                                    View More Shipments
                                  </Button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">
                              No shipping information available
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white shadow rounded-lg p-8 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No orders found
                </h3>
                <p className="text-gray-500">
                  {searchQuery
                    ? "Try a different search term"
                    : "You haven't placed any orders yet"}
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {(customer.orders.pageInfo?.hasNextPage ||
            customer.orders.pageInfo?.hasPreviousPage) && (
            <div className="mt-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange("prev")}
                      className={
                        !customer.orders.pageInfo?.hasPreviousPage
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
                        !customer.orders.pageInfo?.hasNextPage
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      ) : (
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
        </div>
      )}
    </div>
  );
}

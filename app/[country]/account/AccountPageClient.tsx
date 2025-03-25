"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, Truck, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface LineItem {
  id: string;
  name: string;
  quantity: number;
  image?: { url: string; altText: string };
  price: { amount: string; currencyCode: string };
  totalPrice: { amount: string; currencyCode: string };
  totalDiscount: { amount: string; currencyCode: string };
  variantOptions: { name: string; value: string }[];
}

interface Fulfillment {
  id: string;
  estimatedDeliveryAt?: string;
  latestShipmentStatus?: string;
  status: string;
  trackingInformation?: { company: string; number: string; url: string };
  updatedAt: string;
  fulfillmentLineItems: {
    edges: { node: { lineItem: LineItem; quantity: number } }[];
  };
  pageInfo: { hasNextPage: boolean; endCursor: string };
}

interface Order {
  id: string;
  name: string;
  createdAt: string;
  cancelledAt?: string;
  cancelReason?: string;
  currencyCode: string;
  financialStatus: string;
  processedAt: string;
  totalPrice: { amount: string; currencyCode: string };
  lineItems: {
    edges: { node: LineItem; cursor: string }[];
    pageInfo: { hasNextPage: boolean; endCursor: string };
  };
  fulfillments: {
    edges: { node: Fulfillment }[];
    pageInfo: { hasNextPage: boolean; endCursor: string };
  };
}

interface CustomerData {
  id: string;
  displayName: string;
  emailAddress: { emailAddress: string };
  orders: {
    edges: { node: Order; cursor: string }[];
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor: string;
      endCursor: string;
    };
  };
}

// Human-readable mappings
const sortKeyLabels: { [key: string]: string } = {
  CREATED_AT: "Created Date",
  ORDER_NUMBER: "Order Number",
  PROCESSED_AT: "Processed Date",
  RELEVANCE: "Relevance",
  TOTAL_PRICE: "Total Price",
  UPDATED_AT: "Last Updated",
};

const cancelReasonLabels: { [key: string]: string } = {
  CUSTOMER: "You cancelled this order",
  DECLINED: "Payment was declined",
  FRAUD: "Flagged as potentially fraudulent",
  INVENTORY: "Items were out of stock",
  OTHER: "Cancelled for another reason",
  STAFF: "Cancelled due to a staff error",
};

const financialStatusLabels: { [key: string]: string } = {
  AUTHORIZED: "Payment authorized",
  EXPIRED: "Payment authorization expired",
  PAID: "Payment completed",
  PARTIALLY_PAID: "Partially paid",
  PARTIALLY_REFUNDED: "Partially refunded",
  PENDING: "Payment pending",
  REFUNDED: "Fully refunded",
  VOIDED: "Payment voided",
};

const fulfillmentStatusLabels: { [key: string]: string } = {
  PENDING: "Preparing your order",
  SHIPPED: "On its way to you",
  DELIVERED: "Delivered",
  CANCELLED: "Shipment cancelled",
};

export default function AccountPageClient() {
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(5);
  const [sortKey, setSortKey] = useState("CREATED_AT");
  const [reverse, setReverse] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [afterCursor, setAfterCursor] = useState<string | null>(null);
  const [beforeCursor, setBeforeCursor] = useState<string | null>(null);
  const [lineItemCursors, setLineItemCursors] = useState<{
    [orderId: string]: string | null;
  }>({});

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

  useEffect(() => {
    if (isAuthenticated) {
      fetchCustomerData();
    }
  }, [isAuthenticated, currentPage, sortKey, reverse, searchQuery]);

  const fetchCustomerData = async () => {
    try {
      const response = await fetch("/api/customer/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      setCustomer(data.customer);
      setAfterCursor(data.customer.orders.pageInfo.endCursor);
      setBeforeCursor(data.customer.orders.pageInfo.startCursor);
    } catch (error) {
      console.error("Error fetching customer data:", error);
    }
  };

  const fetchMoreLineItems = async (orderId: string) => {
    const cursor = lineItemCursors[orderId] || null;
    try {
      const response = await fetch("/api/customer/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first: 5,
          after: cursor,
          sortKey,
          reverse,
          query: `id:${orderId}`,
        }),
      });
      const data = await response.json();
      const newLineItems = data.customer.orders.edges[0].node.lineItems.edges;
      setCustomer((prev) => {
        if (!prev) return prev;
        const updatedOrders = prev.orders.edges.map((edge) => {
          if (edge.node.id === orderId) {
            return {
              ...edge,
              node: {
                ...edge.node,
                lineItems: {
                  ...edge.node.lineItems,
                  edges: [...edge.node.lineItems.edges, ...newLineItems],
                  pageInfo:
                    data.customer.orders.edges[0].node.lineItems.pageInfo,
                },
              },
            };
          }
          return edge;
        });
        return { ...prev, orders: { ...prev.orders, edges: updatedOrders } };
      });
      setLineItemCursors((prev) => ({
        ...prev,
        [orderId]:
          data.customer.orders.edges[0].node.lineItems.pageInfo.endCursor,
      }));
    } catch (error) {
      console.error("Error fetching more line items:", error);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    window.location.href = "/api/auth/logout";
    setIsLoggingOut(false);
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
    if (direction === "next" && customer?.orders.pageInfo.hasNextPage) {
      setCurrentPage((prev) => prev + 1);
      setBeforeCursor(null);
    } else if (
      direction === "prev" &&
      customer?.orders.pageInfo.hasPreviousPage
    ) {
      setCurrentPage((prev) => prev - 1);
      setAfterCursor(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col items-center py-8 px-4">
      <AnimatePresence>
        {isAuthenticated && customer !== null ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-5xl space-y-8"
          >
            {/* Welcome Section */}
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">
                  Hello, {customer?.displayName || "Friend"}!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Your email: {customer.emailAddress?.emailAddress}
                </p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Here’s everything you need to know about your orders. We’re
                  here to keep you updated!
                </p>
              </CardContent>
            </Card>

            {/* Search and Sort Controls */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 w-full"
            >
              <Input
                placeholder="Search your orders by name, item, or number..."
                value={searchQuery}
                onChange={handleSearch}
                className="flex-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
              <Select onValueChange={handleSortChange} defaultValue={sortKey}>
                <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800">
                  {Object.entries(sortKeyLabels).map(([key, label]) => (
                    <SelectItem
                      key={key}
                      value={key}
                      className="text-gray-900 dark:text-gray-100"
                    >
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleReverseToggle}
                variant="outline"
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {reverse ? "↓ Newest First" : "↑ Oldest First"}
              </Button>
            </motion.div>

            {/* Orders Section */}
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-semibold">Your Order Journey</h2>
              {customer.orders.edges.length > 0 ? (
                customer.orders.edges.map(({ node: order }) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg font-medium">
                            Order {order.name}
                          </CardTitle>
                          <Badge
                            variant={
                              order.cancelledAt
                                ? "destructive"
                                : order.financialStatus === "PAID"
                                ? "default"
                                : "secondary"
                            }
                            className="text-sm"
                          >
                            {order.cancelledAt
                              ? "Cancelled"
                              : financialStatusLabels[order.financialStatus]}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p>
                              <Clock className="inline w-4 h-4 mr-1" />
                              Placed on:{" "}
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                            <p>
                              Processed:{" "}
                              {new Date(order.processedAt).toLocaleDateString()}
                            </p>
                            {order.cancelledAt && (
                              <p className="text-red-600 dark:text-red-400">
                                Cancelled:{" "}
                                {new Date(
                                  order.cancelledAt
                                ).toLocaleDateString()}{" "}
                                -{" "}
                                {
                                  cancelReasonLabels[
                                    order.cancelReason || "OTHER"
                                  ]
                                }
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              Total: {order.totalPrice.amount}{" "}
                              {order.totalPrice.currencyCode}
                            </p>
                          </div>
                        </div>

                        {/* Line Items */}
                        <div>
                          <h3 className="text-md font-medium flex items-center">
                            <Package className="w-5 h-5 mr-2" />
                            What’s Inside
                          </h3>
                          <div className="mt-2 space-y-4">
                            {order.lineItems.edges.map(({ node: item }) => (
                              <motion.div
                                key={item.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.2 }}
                                className="flex items-center gap-4"
                              >
                                {item.image && (
                                  <img
                                    src={item.image.url}
                                    alt={item.image.altText}
                                    className="w-12 h-12 object-cover rounded-md border border-gray-200 dark:border-gray-700"
                                  />
                                )}
                                <div className="flex-1">
                                  <p className="font-medium">{item.name}</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Quantity: {item.quantity} •{" "}
                                    {item.price.amount}{" "}
                                    {item.price.currencyCode}
                                  </p>
                                  {item.totalDiscount.amount !== "0.0" && (
                                    <p className="text-sm text-green-600 dark:text-green-400">
                                      Saved: {item.totalDiscount.amount}{" "}
                                      {item.totalDiscount.currencyCode}
                                    </p>
                                  )}
                                </div>
                              </motion.div>
                            ))}
                            {order.lineItems.pageInfo.hasNextPage && (
                              <Button
                                variant="link"
                                onClick={() => fetchMoreLineItems(order.id)}
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                Show More Items
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Fulfillments */}
                        {order.fulfillments.edges.length > 0 && (
                          <div>
                            <h3 className="text-md font-medium flex items-center">
                              <Truck className="w-5 h-5 mr-2" />
                              Shipping Updates
                            </h3>
                            <div className="mt-2 space-y-2">
                              {order.fulfillments.edges.map(
                                ({ node: fulfillment }) => (
                                  <motion.div
                                    key={fulfillment.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.2 }}
                                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md"
                                  >
                                    <p className="text-sm">
                                      {fulfillmentStatusLabels[
                                        fulfillment.status
                                      ] || fulfillment.status}{" "}
                                      {fulfillment.latestShipmentStatus &&
                                        `(${fulfillment.latestShipmentStatus})`}
                                    </p>
                                    {fulfillment.estimatedDeliveryAt && (
                                      <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Expected by:{" "}
                                        {new Date(
                                          fulfillment.estimatedDeliveryAt
                                        ).toLocaleDateString()}
                                      </p>
                                    )}
                                    {fulfillment.trackingInformation && (
                                      <p className="text-sm">
                                        Track it:{" "}
                                        <a
                                          href={
                                            fulfillment.trackingInformation.url
                                          }
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 dark:text-blue-400 hover:underline"
                                        >
                                          {
                                            fulfillment.trackingInformation
                                              .company
                                          }{" "}
                                          -{" "}
                                          {
                                            fulfillment.trackingInformation
                                              .number
                                          }
                                        </a>
                                      </p>
                                    )}
                                  </motion.div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <Card className="bg-white dark:bg-gray-800 shadow-md">
                  <CardContent className="pt-6 text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                      No orders yet! Ready to start shopping?
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Pagination */}
              {(customer.orders.pageInfo.hasNextPage ||
                customer.orders.pageInfo.hasPreviousPage) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="flex justify-center mt-6"
                >
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange("prev")}
                      disabled={!customer.orders.pageInfo.hasPreviousPage}
                      className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                    >
                      Page {currentPage}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange("next")}
                      disabled={!customer.orders.pageInfo.hasNextPage}
                      className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                    >
                      Next
                    </Button>
                  </div>
                </motion.div>
              )}
            </motion.section>

            {/* Logout Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <Button
                onClick={handleLogout}
                disabled={isLoggingOut}
                variant="outline"
                className="w-full max-w-xs bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {isLoggingOut ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="animate-spin w-4 h-4" />
                    Logging out...
                  </div>
                ) : (
                  "Sign Out"
                )}
              </Button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center min-h-screen"
          >
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardContent className="pt-6 flex items-center gap-2">
                <Loader2 className="animate-spin w-6 h-6 text-blue-500 dark:text-blue-400" />
                <p>Loading your account details...</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

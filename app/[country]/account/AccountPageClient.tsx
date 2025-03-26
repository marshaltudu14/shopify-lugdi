"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Loader2, Search } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { getCurrencySymbol } from "@/lib/countries";
import Link from "next/link";

interface LineItem {
  id: string;
  name: string;
  quantity: number;
  image?: {
    url: string;
    altText?: string;
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
  variantOptions?: Array<{
    name: string;
    value: string;
  }>;
}

interface FulfillmentLineItem {
  id: string;
  lineItem: LineItem;
  quantity: number;
}

interface Fulfillment {
  id: string;
  estimatedDeliveryAt?: string;
  latestShipmentStatus?: string;
  status: string;
  fulfillmentLineItems: {
    edges: Array<{
      cursor: string;
      node: FulfillmentLineItem;
    }>;
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor: string;
      endCursor: string;
    };
  };
  trackingInformation?: Array<{
    company: string;
    number: string;
    url?: string;
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
      cursor: string;
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
      cursor: string;
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
      cursor: string;
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
  PENDING: "Payment Pending",
  REFUNDED: "Money Refunded",
  VOIDED: "Voided",
};

const cancelReasonMap: Record<string, string> = {
  CUSTOMER: "Cancelled by Customer",
  DECLINED: "Payment Declined",
  FRAUD: "Fraudulent Order",
  INVENTORY: "Out of Stock",
  OTHER: "Other Reason",
  STAFF: "Internal Error",
};

const fulfillmentStatusMap: Record<string, string> = {
  CANCELLED: "Cancelled",
  ERROR: "Error",
  FAILURE: "Failure",
  SUCCESS: "Success",
  OPEN: "Open",
  PENDING: "Pending",
};

export default function AccountPageClient() {
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchLoading, setIsFetchLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(1);
  const [sortKey, setSortKey] = useState("CREATED_AT");
  const [reverse, setReverse] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedLineItems, setExpandedLineItems] = useState<
    Record<string, boolean>
  >({});
  const [expandedFulfillments, setExpandedFulfillments] = useState<
    Record<string, boolean>
  >({});

  const directionRef = useRef<"next" | "prev" | null>(null);

  // Check authentication status
  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch(`/api/auth/check-auth`);
        const data = await response.json();

        if (!data.authenticated) {
          router.push("/login");
        }

        setIsAuthenticated(data.authenticated);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUser();
  }, [router]);

  // State to track when to actually perform the search
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // Debounce search query to avoid loading state on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms delay before applying the search

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch customer data with pagination, sort, and search
  useEffect(() => {
    const fetchCustomerData = async () => {
      setIsLoading(true);
      try {
        // Determine cursors based on direction
        const after =
          directionRef.current === "next"
            ? customer?.orders.pageInfo.endCursor
            : null;
        const before =
          directionRef.current === "prev"
            ? customer?.orders.pageInfo.startCursor
            : null;

        const response = await fetch("/api/customer/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            first: ordersPerPage,
            after: directionRef.current === "next" ? after : null,
            before: directionRef.current === "prev" ? before : null,
            sortKey,
            reverse,
            query: debouncedSearchQuery || undefined,
          }),
        });
        const data = await response.json();
        setCustomer(data.customer);
        directionRef.current = null;
      } catch (error) {
        console.error("Error fetching customer data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchCustomerData();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isAuthenticated,
    currentPage,
    sortKey,
    reverse,
    debouncedSearchQuery,
    ordersPerPage,
  ]);

  const fetchMoreLineItems = async (orderId: string, afterCursor: string) => {
    setIsFetchLoading(true);
    try {
      const response = await fetch("/api/customer/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lineItemsFirst: 5,
          lineItemsAfter: afterCursor,
        }),
      });
      const data = await response.json();

      // Step-by-step response validation
      const orders = data?.customer?.orders?.edges;
      if (!orders || !Array.isArray(orders)) {
        throw new Error("Invalid orders data in response");
      }

      // Find the order that contains the new line items
      const orderWithNewItems = orders.find(
        (edge) => edge?.node?.id === orderId
      );

      if (!orderWithNewItems) {
        throw new Error("Order not found in response");
      }

      const newLineItems = orderWithNewItems.node.lineItems;
      if (!newLineItems?.edges || !newLineItems?.pageInfo) {
        throw new Error("Invalid line items data in response");
      }

      // Update state with the new items
      setCustomer((prevCustomer) => {
        if (!prevCustomer) return prevCustomer;

        return {
          ...prevCustomer,
          orders: {
            ...prevCustomer.orders,
            edges: prevCustomer.orders.edges.map((orderEdge) => {
              if (orderEdge.node.id === orderId) {
                return {
                  ...orderEdge,
                  node: {
                    ...orderEdge.node,
                    lineItems: {
                      edges: [
                        ...orderEdge.node.lineItems.edges,
                        ...newLineItems.edges,
                      ],
                      pageInfo: newLineItems.pageInfo,
                    },
                  },
                };
              }
              return orderEdge;
            }),
          },
        };
      });
    } catch (error) {
      console.error("Error fetching more line items:", error);
    } finally {
      setIsFetchLoading(false);
    }
  };

  const fetchMoreFulfillments = async (
    orderId: string,
    afterCursor: string
  ) => {
    setIsFetchLoading(true);
    try {
      const response = await fetch("/api/customer/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fulfillmentsFirst: 5,
          fulfillmentsAfter: afterCursor,
        }),
      });
      const data = await response.json();

      // Validate response structure
      const orders = data?.customer?.orders?.edges;
      if (!orders || !Array.isArray(orders)) {
        throw new Error("Invalid orders data in response");
      }

      // Find the specific order in response
      const order = orders.find((edge) => edge?.node?.id === orderId);
      if (!order) {
        throw new Error("Order not found in response");
      }

      const newFulfillments = order.node.fulfillments;
      if (!newFulfillments || !Array.isArray(newFulfillments.edges)) {
        throw new Error("Invalid fulfillments data in response");
      }

      setCustomer((prevCustomer) => {
        if (!prevCustomer) return prevCustomer;

        return {
          ...prevCustomer,
          orders: {
            ...prevCustomer.orders,
            edges: prevCustomer.orders.edges.map((orderEdge) => {
              if (orderEdge.node.id === orderId) {
                return {
                  ...orderEdge,
                  node: {
                    ...orderEdge.node,
                    fulfillments: {
                      edges: [
                        ...orderEdge.node.fulfillments.edges,
                        ...newFulfillments.edges,
                      ],
                      pageInfo: newFulfillments.pageInfo,
                    },
                  },
                };
              }
              return orderEdge;
            }),
          },
        };
      });
    } catch (error) {
      console.error("Error fetching more fulfillments:", error);
    } finally {
      setIsFetchLoading(false);
    }
  };

  const fetchMoreFulfillmentLineItems = async (
    orderId: string,
    fulfillmentId: string,
    afterCursor: string
  ) => {
    setIsFetchLoading(true);
    try {
      const response = await fetch("/api/customer/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fulfillmentLineItemsFirst: 5,
          fulfillmentLineItemsAfter: afterCursor,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // More robust response checking
      const orders = data?.customer?.orders?.edges;
      if (!orders || !Array.isArray(orders)) {
        throw new Error("Invalid orders data");
      }

      // Find the specific order
      const order = orders.find((edge) => edge?.node?.id === orderId);
      if (!order) {
        throw new Error("Order not found in response");
      }

      const fulfillments = order.node.fulfillments?.edges;
      if (!fulfillments || !Array.isArray(fulfillments)) {
        throw new Error("Invalid fulfillments data");
      }

      // Find the specific fulfillment
      const fulfillment = fulfillments.find(
        (edge) => edge?.node?.id === fulfillmentId
      );
      if (!fulfillment) {
        throw new Error("Fulfillment not found in response");
      }

      const newItems = fulfillment.node.fulfillmentLineItems;
      if (!newItems) {
        throw new Error("Fulfillment line items not found");
      }

      setCustomer((prevCustomer) => {
        if (!prevCustomer) return prevCustomer;

        return {
          ...prevCustomer,
          orders: {
            ...prevCustomer.orders,
            edges: prevCustomer.orders.edges.map((orderEdge) => {
              if (orderEdge.node.id === orderId) {
                return {
                  ...orderEdge,
                  node: {
                    ...orderEdge.node,
                    fulfillments: {
                      ...orderEdge.node.fulfillments,
                      edges: orderEdge.node.fulfillments.edges.map(
                        (fulfillmentEdge) => {
                          if (fulfillmentEdge.node.id === fulfillmentId) {
                            return {
                              ...fulfillmentEdge,
                              node: {
                                ...fulfillmentEdge.node,
                                fulfillmentLineItems: {
                                  edges: [
                                    ...fulfillmentEdge.node.fulfillmentLineItems
                                      .edges,
                                    ...newItems.edges,
                                  ],
                                  pageInfo: newItems.pageInfo,
                                },
                              },
                            };
                          }
                          return fulfillmentEdge;
                        }
                      ),
                    },
                  },
                };
              }
              return orderEdge;
            }),
          },
        };
      });
    } catch (error) {
      console.error("Error fetching more fulfillment line items:", error);
    } finally {
      setIsFetchLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      window.location.href = "/api/auth/logout";
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleSortChange = (value: string) => {
    setSortKey(value);
    setCurrentPage(1);
  };

  const handleReverseToggle = () => {
    setReverse(!reverse);
    setCurrentPage(1);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Only reset page, but don't trigger loading state directly
    // The actual search will happen after debounce via useEffect
    setCurrentPage(1);
  };

  const handlePageChange = (direction: "next" | "prev") => {
    if (!customer) return;

    if (direction === "next" && customer.orders.pageInfo.hasNextPage) {
      directionRef.current = "next";
      setCurrentPage((prev) => prev + 1);
    } else if (
      direction === "prev" &&
      customer.orders.pageInfo.hasPreviousPage
    ) {
      directionRef.current = "prev";
      setCurrentPage((prev) => prev - 1);
    }
  };

  const toggleLineItemsExpansion = (orderId: string) => {
    setExpandedLineItems((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const toggleFulfillmentsExpansion = (orderId: string) => {
    setExpandedFulfillments((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const dateOptions: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };

    const datePart = date.toLocaleDateString("en-US", dateOptions);
    const timePart = date.toLocaleTimeString("en-US", timeOptions);

    return `${datePart} at ${timePart}`;
  };

  // Only show full-page loader for initial load, not for search updates
  if (isAuthenticated === null || customer === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {isAuthenticated && customer && (
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-between items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold">My Account</h1>
              <p className="text-muted-foreground truncate">
                Welcome back, {customer?.displayName || "Customer"}
              </p>
            </div>
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle>Order History</CardTitle>
                  <CardDescription>
                    View and manage your recent orders
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                  <div className="relative w-full">
                    {isLoading ? (
                      <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
                    ) : (
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    )}
                    <Input
                      placeholder="Search orders..."
                      className="pl-9 w-full"
                      value={searchQuery}
                      onChange={handleSearch}
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <Select onValueChange={handleSortChange} value={sortKey}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CREATED_AT">Created At</SelectItem>
                        <SelectItem value="ORDER_NUMBER">
                          Order Number
                        </SelectItem>
                        <SelectItem value="TOTAL_PRICE">Total Price</SelectItem>
                        <SelectItem value="UPDATED_AT">Updated At</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      className="cursor-pointer"
                      variant="outline"
                      size="icon"
                      onClick={handleReverseToggle}
                    >
                      {reverse ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {customer?.orders.edges.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No orders found</p>
                  <Button
                    className="mt-4 cursor-pointer"
                    onClick={() => setSearchQuery("")}
                  >
                    Clear search
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {customer?.orders.edges.map(({ node: order }) => (
                    <Card key={order.id}>
                      <CardHeader className="pb-0">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <div>
                            <CardTitle className="text-lg">
                              Order {order.name}
                            </CardTitle>
                            <CardDescription>
                              Placed on {formatDate(order.createdAt)}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                order.financialStatus === "PAID" ||
                                order.financialStatus === "REFUNDED"
                                  ? "default"
                                  : order.financialStatus ===
                                      "PARTIALLY_REFUNDED" ||
                                    order.financialStatus === "PARTIALLY_PAID"
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {financialStatusMap[order.financialStatus] ||
                                order.financialStatus}
                            </Badge>
                            {order.cancelledAt && (
                              <Badge variant="destructive">
                                {cancelReasonMap[
                                  order.cancelReason || "OTHER"
                                ] || "Cancelled"}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="font-medium">Order Total</p>
                            <p>
                              {getCurrencySymbol(order.totalPrice.currencyCode)}
                              {order.totalPrice.amount}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 space-y-6">
                          <Collapsible
                            open={expandedLineItems[order.id]}
                            onOpenChange={() =>
                              toggleLineItemsExpansion(order.id)
                            }
                          >
                            <div className="flex justify-between items-center">
                              <CollapsibleTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="w-full flex justify-between items-center"
                                >
                                  <p className="font-bold">Order Items</p>
                                  {expandedLineItems[order.id] ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </Button>
                              </CollapsibleTrigger>
                            </div>
                            <Separator className="my-2" />
                            <CollapsibleContent>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Qty</TableHead>
                                    <TableHead className="text-right">
                                      Total
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {order.lineItems.edges.map(
                                    ({ node: item }, index) => (
                                      <TableRow key={`${item.id}-${index}`}>
                                        <TableCell>
                                          <div className="flex items-center gap-3">
                                            {item.image && (
                                              <Image
                                                src={item.image.url}
                                                alt={item.image.altText || ""}
                                                width={250}
                                                height={250}
                                                className="w-10 h-10 rounded object-cover"
                                              />
                                            )}
                                            <div>
                                              <p className="font-medium truncate">
                                                {item.name}
                                              </p>
                                              {item.variantOptions &&
                                                item.variantOptions.length >
                                                  1 && (
                                                  <p className="text-sm text-muted-foreground">
                                                    {item.variantOptions
                                                      .map(
                                                        (opt) =>
                                                          `${opt.name}: ${opt.value}`
                                                      )
                                                      .join(", ")}
                                                  </p>
                                                )}
                                            </div>
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          {getCurrencySymbol(
                                            item.price.currencyCode
                                          )}
                                          {Number(item.price.amount).toFixed(2)}
                                        </TableCell>
                                        <TableCell>{item.quantity}</TableCell>
                                        <TableCell className="text-right">
                                          {getCurrencySymbol(
                                            item.totalPrice.currencyCode
                                          )}
                                          {Number(
                                            item.totalPrice.amount
                                          ).toFixed(2)}
                                        </TableCell>
                                      </TableRow>
                                    )
                                  )}
                                </TableBody>
                              </Table>
                              {order.lineItems.pageInfo.hasNextPage && (
                                <div className="mt-2 flex justify-center">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      fetchMoreLineItems(
                                        order.id,
                                        order.lineItems.pageInfo.endCursor
                                      )
                                    }
                                    disabled={isFetchLoading}
                                  >
                                    {isFetchLoading ? (
                                      <Loader2 className="animate-spin" />
                                    ) : (
                                      "Load More Items"
                                    )}
                                  </Button>
                                </div>
                              )}
                            </CollapsibleContent>
                          </Collapsible>

                          {/* Fulfillment Collapsible */}
                          {order.fulfillments.edges.length > 0 && (
                            <Collapsible
                              open={expandedFulfillments[order.id]}
                              onOpenChange={() =>
                                toggleFulfillmentsExpansion(order.id)
                              }
                            >
                              <div className="flex justify-between items-center">
                                <CollapsibleTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className="w-full flex justify-between items-center"
                                  >
                                    <p className="font-bold">Fulfillments</p>
                                    {expandedFulfillments[order.id] ? (
                                      <ChevronUp className="h-4 w-4" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4" />
                                    )}
                                  </Button>
                                </CollapsibleTrigger>
                              </div>
                              <Separator className="my-2" />
                              <CollapsibleContent>
                                <div className="space-y-4">
                                  {order.fulfillments.edges.map(
                                    ({ node: fulfillment }) => (
                                      <Card key={fulfillment.id}>
                                        <CardHeader className="pb-2">
                                          <div className="flex justify-between items-center">
                                            <CardTitle className="text-sm">
                                              Fulfillment
                                            </CardTitle>
                                            <Badge
                                              variant={
                                                fulfillment.status === "SUCCESS"
                                                  ? "default"
                                                  : fulfillment.status ===
                                                      "Pending" || "OPEN"
                                                  ? "secondary"
                                                  : "destructive"
                                              }
                                            >
                                              {fulfillmentStatusMap[
                                                fulfillment.status
                                              ] || fulfillment.status}
                                            </Badge>
                                          </div>
                                        </CardHeader>
                                        <CardContent className="pt-2">
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                              <p className="font-medium">
                                                Last Updated
                                              </p>
                                              <p>
                                                {formatDate(
                                                  fulfillment.updatedAt
                                                )}
                                              </p>
                                            </div>
                                            {fulfillment.estimatedDeliveryAt && (
                                              <div>
                                                <p className="font-medium">
                                                  Estimated Delivery
                                                </p>
                                                <p>
                                                  {formatDate(
                                                    fulfillment.estimatedDeliveryAt
                                                  )}
                                                </p>
                                              </div>
                                            )}
                                          </div>

                                          {fulfillment.trackingInformation &&
                                            fulfillment.trackingInformation
                                              .length > 0 && (
                                              <div className="mt-4">
                                                <p className="font-medium mb-2">
                                                  Tracking Information
                                                </p>
                                                <div className="space-y-2">
                                                  {fulfillment.trackingInformation.map(
                                                    (tracking, idx) => (
                                                      <div
                                                        key={idx}
                                                        className="flex items-center gap-2"
                                                      >
                                                        <span className="font-medium">
                                                          {tracking.company}:
                                                        </span>
                                                        {tracking.url ? (
                                                          <Link
                                                            href={tracking.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-primary underline"
                                                          >
                                                            {tracking.number}
                                                          </Link>
                                                        ) : (
                                                          <span>
                                                            {tracking.number}
                                                          </span>
                                                        )}
                                                      </div>
                                                    )
                                                  )}
                                                </div>
                                              </div>
                                            )}

                                          <div className="mt-4">
                                            <Table>
                                              <TableHeader>
                                                <TableRow>
                                                  <TableHead>Product</TableHead>
                                                  <TableHead>Qty</TableHead>
                                                </TableRow>
                                              </TableHeader>
                                              <TableBody>
                                                {fulfillment.fulfillmentLineItems.edges.map(
                                                  ({ node: item }) => (
                                                    <TableRow key={item.id}>
                                                      <TableCell>
                                                        <div className="flex items-center gap-3">
                                                          {item.lineItem
                                                            .image && (
                                                            <Image
                                                              src={
                                                                item.lineItem
                                                                  .image.url
                                                              }
                                                              alt={
                                                                item.lineItem
                                                                  .image
                                                                  .altText || ""
                                                              }
                                                              width={250}
                                                              height={250}
                                                              className="w-10 h-10 rounded object-cover"
                                                            />
                                                          )}
                                                          <div>
                                                            <p className="font-medium">
                                                              {
                                                                item.lineItem
                                                                  .name
                                                              }
                                                            </p>
                                                            {item.lineItem
                                                              .variantOptions &&
                                                              item.lineItem
                                                                .variantOptions
                                                                .length > 1 && (
                                                                <p className="text-sm text-muted-foreground">
                                                                  {item.lineItem.variantOptions
                                                                    .map(
                                                                      (opt) =>
                                                                        `${opt.name}: ${opt.value}`
                                                                    )
                                                                    .join(", ")}
                                                                </p>
                                                              )}
                                                          </div>
                                                        </div>
                                                      </TableCell>
                                                      <TableCell>
                                                        {item.quantity}
                                                      </TableCell>
                                                    </TableRow>
                                                  )
                                                )}
                                              </TableBody>
                                            </Table>
                                            {fulfillment.fulfillmentLineItems
                                              .pageInfo.hasNextPage && (
                                              <div className="mt-2 flex justify-center">
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() =>
                                                    fetchMoreFulfillmentLineItems(
                                                      order.id,
                                                      fulfillment.id,
                                                      fulfillment
                                                        .fulfillmentLineItems
                                                        .pageInfo.endCursor
                                                    )
                                                  }
                                                  disabled={isFetchLoading}
                                                >
                                                  {isFetchLoading ? (
                                                    <Loader2 className="animate-spin" />
                                                  ) : (
                                                    "Load More Items"
                                                  )}
                                                </Button>
                                              </div>
                                            )}
                                          </div>
                                        </CardContent>
                                      </Card>
                                    )
                                  )}
                                </div>

                                {order.fulfillments.pageInfo.hasNextPage && (
                                  <div className="mt-4 flex justify-center">
                                    <Button
                                      variant="outline"
                                      onClick={() =>
                                        fetchMoreFulfillments(
                                          order.id,
                                          order.fulfillments.pageInfo.endCursor
                                        )
                                      }
                                    >
                                      Load More Fulfillments
                                    </Button>
                                  </div>
                                )}
                              </CollapsibleContent>
                            </Collapsible>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-center items-center">
              <Pagination className="m-0">
                <PaginationContent>
                  <PaginationItem>
                    <Button
                      variant="ghost"
                      className="cursor-pointer"
                      onClick={() => handlePageChange("prev")}
                      disabled={
                        !customer?.orders.pageInfo.hasPreviousPage ||
                        isFetchLoading
                      }
                    >
                      <PaginationPrevious />
                    </Button>
                  </PaginationItem>
                  <PaginationItem>
                    <span className="text-sm px-4">Page {currentPage}</span>
                  </PaginationItem>
                  <PaginationItem>
                    <Button
                      variant="ghost"
                      className="cursor-pointer"
                      onClick={() => handlePageChange("next")}
                      disabled={
                        !customer?.orders.pageInfo.hasNextPage || isLoading
                      }
                    >
                      <PaginationNext />
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}

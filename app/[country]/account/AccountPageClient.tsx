"use client";

import { useState, useEffect } from "react";
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
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(1);
  const [sortKey, setSortKey] = useState("CREATED_AT");
  const [reverse, setReverse] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>(
    {}
  );
  const [expandedLineItems, setExpandedLineItems] = useState<
    Record<string, boolean>
  >({});
  const [expandedFulfillments, setExpandedFulfillments] = useState<
    Record<string, boolean>
  >({});

  // Check authentication status
  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch(`/api/auth/check-auth`);
        const data = await response.json();
        setIsAuthenticated(data.authenticated);
        if (!data.authenticated) {
          router.push("/login");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUser();
  }, [router]);

  // Fetch customer data with pagination, sort, and search
  useEffect(() => {
    if (isAuthenticated) {
      fetchCustomerData();
    }
  }, [isAuthenticated, currentPage, sortKey, reverse, searchQuery]);

  const fetchCustomerData = async () => {
    setIsLoading(true);
    try {
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
        }),
      });
      const data = await response.json();
      setCustomer(data.customer);
    } catch (error) {
      console.error("Error fetching customer data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMoreLineItems = async (orderId: string, afterCursor: string) => {
    try {
      const response = await fetch("/api/customer/info", {
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
      // Update the specific order's line items
      if (customer) {
        setCustomer({
          ...customer,
          orders: {
            ...customer.orders,
            edges: customer.orders.edges.map((edge) => {
              if (edge.node.id === orderId) {
                return {
                  ...edge,
                  node: {
                    ...edge.node,
                    lineItems: {
                      edges: [
                        ...edge.node.lineItems.edges,
                        ...data.customer.orders.edges[0].node.lineItems.edges,
                      ],
                      pageInfo:
                        data.customer.orders.edges[0].node.lineItems.pageInfo,
                    },
                  },
                };
              }
              return edge;
            }),
          },
        });
      }
    } catch (error) {
      console.error("Error fetching more line items:", error);
    }
  };

  const fetchMoreFulfillments = async (
    orderId: string,
    afterCursor: string
  ) => {
    try {
      const response = await fetch("/api/customer/info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fulfillmentsFirst: 3,
          fulfillmentsAfter: afterCursor,
        }),
      });
      const data = await response.json();
      // Update the specific order's fulfillments
      if (customer) {
        setCustomer({
          ...customer,
          orders: {
            ...customer.orders,
            edges: customer.orders.edges.map((edge) => {
              if (edge.node.id === orderId) {
                return {
                  ...edge,
                  node: {
                    ...edge.node,
                    fulfillments: {
                      edges: [
                        ...edge.node.fulfillments.edges,
                        ...data.customer.orders.edges[0].node.fulfillments
                          .edges,
                      ],
                      pageInfo:
                        data.customer.orders.edges[0].node.fulfillments
                          .pageInfo,
                    },
                  },
                };
              }
              return edge;
            }),
          },
        });
      }
    } catch (error) {
      console.error("Error fetching more fulfillments:", error);
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
    setCurrentPage(1);
  };

  const handlePageChange = (direction: "next" | "prev") => {
    if (direction === "next" && customer?.orders.pageInfo.hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    } else if (
      direction === "prev" &&
      customer?.orders.pageInfo.hasPreviousPage
    ) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
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
    const options: Intl.DateTimeFormatOptions = {
      month: "short", // e.g., "Mar"
      day: "numeric", // e.g., "25"
      year: "numeric", // e.g., "2025"
      hour: "numeric", // e.g., "2"
      minute: "2-digit", // e.g., "00"
      hour12: true, // e.g., "PM"
    };
    return date.toLocaleString("en-US", options).replace(/,/, " at"); // e.g., "Mar 25 2025 at 2:00 PM"
  };

  const formatCurrency = (amount: string, currencyCode: string) => {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
    }).format(parseFloat(amount));
  };

  if (isLoading || isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Redirect handled in useEffect
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Account</h1>
          <p className="text-muted-foreground">
            Welcome back, {customer?.displayName || "Customer"}
          </p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-medium">Name</p>
              <p>{customer?.displayName || "Not available"}</p>
            </div>
            <div>
              <p className="font-medium">Email</p>
              <p>{customer?.emailAddress.emailAddress || "Not available"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

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
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  className="pl-9 w-full"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
              <div className="flex gap-2">
                <Select onValueChange={handleSortChange} value={sortKey}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CREATED_AT">Date</SelectItem>
                    <SelectItem value="ORDER_NUMBER">Order Number</SelectItem>
                    <SelectItem value="PROCESSED_AT">Processed At</SelectItem>
                    <SelectItem value="TOTAL_PRICE">Total Price</SelectItem>
                    <SelectItem value="UPDATED_AT">Updated At</SelectItem>
                  </SelectContent>
                </Select>
                <Button
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
              <Button className="mt-4" onClick={() => setSearchQuery("")}>
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
                          Order #{order.name}
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
                            {cancelReasonMap[order.cancelReason || "OTHER"] ||
                              "Cancelled"}
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleOrderExpansion(order.id)}
                        >
                          {expandedOrders[order.id] ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="font-medium">Order Total</p>
                        <p>
                          {formatCurrency(
                            order.totalPrice.amount,
                            order.totalPrice.currencyCode
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Processed At</p>
                        <p>{formatDate(order.processedAt)}</p>
                      </div>
                    </div>

                    {expandedOrders[order.id] && (
                      <div className="mt-4 space-y-6">
                        <Collapsible
                          open={expandedLineItems[order.id]}
                          onOpenChange={() =>
                            toggleLineItemsExpansion(order.id)
                          }
                        >
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium">Items</h3>
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" size="sm">
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
                                            <p className="font-medium">
                                              {item.name}
                                            </p>
                                            {item.variantOptions && (
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
                                        {formatCurrency(
                                          item.price.amount,
                                          item.price.currencyCode
                                        )}
                                      </TableCell>
                                      <TableCell>{item.quantity}</TableCell>
                                      <TableCell className="text-right">
                                        {formatCurrency(
                                          item.totalPrice.amount,
                                          item.totalPrice.currencyCode
                                        )}
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
                                >
                                  Load More Items
                                </Button>
                              </div>
                            )}
                          </CollapsibleContent>
                        </Collapsible>

                        {order.fulfillments.edges.length > 0 && (
                          <Collapsible
                            open={expandedFulfillments[order.id]}
                            onOpenChange={() =>
                              toggleFulfillmentsExpansion(order.id)
                            }
                          >
                            <div className="flex justify-between items-center">
                              <h3 className="font-medium">Fulfillments</h3>
                              <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm">
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
                                              fulfillment.status === "FULFILLED"
                                                ? "default"
                                                : fulfillment.status ===
                                                  "IN_PROGRESS"
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
                                                        <a
                                                          href={tracking.url}
                                                          target="_blank"
                                                          rel="noopener noreferrer"
                                                          className="text-primary underline"
                                                        >
                                                          {tracking.number}
                                                        </a>
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
                                          <p className="font-medium mb-2">
                                            Fulfilled Items
                                          </p>
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
                                                            {item.lineItem.name}
                                                          </p>
                                                          {item.lineItem
                                                            .variantOptions && (
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
                                                  fetchMoreFulfillments(
                                                    order.id,
                                                    fulfillment
                                                      .fulfillmentLineItems
                                                      .pageInfo.endCursor
                                                  )
                                                }
                                              >
                                                Load More Items
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
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Showing page {currentPage}
          </div>
          <Pagination className="m-0">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange("prev")}
                  disabled={!customer?.orders.pageInfo.hasPreviousPage}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange("next")}
                  disabled={!customer?.orders.pageInfo.hasNextPage}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      </Card>
    </div>
  );
}

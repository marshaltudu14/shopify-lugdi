export interface LineItem {
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

export interface Fulfillment {
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

export interface Order {
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

export interface CustomerData {
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

"use client";

import { useEffect, useState } from "react";

interface Order {
  id: string;
  name: string;
  totalPrice: {
    amount: string;
    currencyCode: string;
  };
  createdAt: string;
}

interface CustomerData {
  id: string;
  firstName: string;
  lastName: string;
  emailAddress: { emailAddress: string };
  phoneNumber: { phoneNumber: string } | null;
  orders: { edges: { node: Order }[] };
}

export default function AccountPageClient() {
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCustomerData() {
      try {
        const res = await fetch("/api/customer/data");
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const data = await res.json();
        setCustomer(data.customer);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCustomerData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!customer) return <p>No customer data found.</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Account</h1>

      {/* User Data */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold">Profile</h2>
        <p>
          <strong>Name:</strong> {customer.firstName} {customer.lastName}
        </p>
        <p>
          <strong>Email:</strong> {customer.emailAddress.emailAddress}
        </p>
        <p>
          <strong>Phone:</strong>{" "}
          {customer.phoneNumber?.phoneNumber || "Not provided"}
        </p>
      </section>

      {/* Order History */}
      <section>
        <h2 className="text-xl font-semibold">Order History</h2>
        {customer.orders.edges.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <ul className="space-y-4">
            {customer.orders.edges.map(({ node: order }) => (
              <li key={order.id} className="border p-4 rounded">
                <p>
                  <strong>Order:</strong> {order.name}
                </p>
                <p>
                  <strong>Total:</strong> {order.totalPrice.amount}{" "}
                  {order.totalPrice.currencyCode}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

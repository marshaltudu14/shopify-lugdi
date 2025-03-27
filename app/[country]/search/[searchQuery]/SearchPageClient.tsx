"use client";

import { useParams } from "next/navigation";
import React, { useState } from "react";

export default function SearchPageClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const params = useParams();

  return (
    <div className="min-h-screen px-2 py-2 md:px-3 md:py-3 lg:px-5 lg:py-5"></div>
  );
}

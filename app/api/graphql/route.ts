import { NextRequest, NextResponse } from "next/server";
import products from "@/lib/mock-data/products.json";
import detailedProducts from "@/lib/mock-data/detailedProducts.json";
import getCollectionProducts from "@/lib/mock-data/getCollectionProducts.json";
import cart from "@/lib/mock-data/cart.json";
import menu from "@/lib/mock-data/menu.json";
import shopPolicies from "@/lib/mock-data/shopPolicies.json";
import wishlist from "@/lib/mock-data/wishlist.json";
import productRecommendations from "@/lib/mock-data/productRecommendations.json";
import cartVariants from "@/lib/mock-data/cartVariants.json";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { query, variables } = body;

  let data;

  if (query.includes("getProducts")) {
    data = {
      data: {
        products: {
          edges: products.map((p, i) => ({ cursor: String(i + 1), node: p })),
          pageInfo: {
            hasNextPage: false,
            endCursor: String(products.length),
          },
        },
      },
    };
  } else if (query.includes("getSingleProduct")) {
    // Find product by handle from detailed products data
    const foundProduct = detailedProducts.find(p => p.product.handle === variables.handle);
    data = {
      data: {
        product: foundProduct?.product || null,
      },
    };
  } else if (query.includes("getCollectionProducts")) {
    interface MockCollection {
  handle: string;
  // Add other properties of your mock collection here if needed
}

    const collection = (getCollectionProducts as MockCollection[]).find(c => c.handle === variables.handle);
    data = {
      data: {
        collection: collection || null, // Explicitly return null if not found
      },
    };
  } else if (query.includes("getCart")) {
    data = {
      data: {
        cart: cart,
      },
    };
  } else if (query.includes("GetMenu")) {
    // Ensure menu structure is correct for Apollo Client
    const safeMenu = {
      ...menu.menu,
      items: menu.menu.items.map(item => ({
        ...item,
        // Ensure all required fields are present
        title: item.title || "",
        url: item.url || "",
        resource: item.resource || null,
      }))
    };

    data = {
      data: {
        menu: safeMenu,
      },
    };
  } else if (query.includes("CreateCart")) {
    data = {
      data: {
        cartCreate: {
          cart: cart,
        },
      },
    };
  } else if (query.includes("cartLinesAdd")) {
    data = {
      data: {
        cartLinesAdd: {
          cart: cart,
        },
      },
    };
  } else if (query.includes("cartLinesRemove")) {
    data = {
      data: {
        cartLinesRemove: {
          cart: cart,
        },
      },
    };
  } else if (query.includes("cartLinesUpdate")) {
    data = {
      data: {
        cartLinesUpdate: {
          cart: cart,
        },
      },
    };
  } else if (query.includes("GetShopPolicies")) {
    data = {
      data: shopPolicies,
    };
  } else if (query.includes("getWishlistItemsDetails")) {
    data = {
      data: {
        nodes: wishlist,
      },
    };
  } else if (query.includes("getSingleProductRecommendation")) {
    data = {
      data: {
        productRecommendations: productRecommendations,
      },
    };
  } else if (query.includes("getCartVariants")) {
    data = {
      data: {
        nodes: cartVariants,
      },
    };
  } else if (query.includes("GetShopPolicies")) {
    data = {
      data: {
        shop: shopPolicies,
      },
    };
  } else if (query.includes("getWishlistItemsDetails")) {
    // Handle wishlist items query - return variants based on IDs
    const requestedIds = variables.ids || [];
    const wishlistVariants = wishlist.filter(item => requestedIds.includes(item.id));
    data = {
      data: {
        nodes: wishlistVariants,
      },
    };
  } else {
    data = {
      data: {},
    };
  }

  return NextResponse.json(data);
}

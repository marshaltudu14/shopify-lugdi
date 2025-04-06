import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import ProductCard from './ProductCard';
import { CollectionProductNode } from '@/lib/types/collection'; // Adjust path if needed

// --- Mocking Dependencies ---

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  // Use React.ComponentProps<'img'> for a reasonable approximation of Image props
  default: (props: React.ComponentProps<'img'>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock WishlistButton
jest.mock('./WishlistButton', () => ({
  __esModule: true,
  default: jest.fn(({ variantId }) => (
    <button data-testid="mock-wishlist-button" data-variant-id={variantId}>
      Wishlist
    </button>
  )),
}));

// Mock framer-motion (basic mock to prevent animation errors and warnings)
jest.mock('framer-motion', () => {
  const actual = jest.requireActual('framer-motion');
  return {
    ...actual,
    motion: {
      // Mock specific motion components used in ProductCard
      // Filter out motion-specific props to avoid React warnings using eslint disable
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      div: jest.fn(({ children, whileHover, variants, initial, animate, ...props }) => (
        <div {...props}>{children}</div>
      )),
      // Add other motion components if needed (e.g., p, span)
      p: jest.fn(({ children, ...props }) => <p {...props}>{children}</p>),
      span: jest.fn(({ children, ...props }) => <span {...props}>{children}</span>),
    },
    AnimatePresence: jest.fn(({ children }) => <>{children}</>), // Simple pass-through
  };
});

// Mock GlowingEffect (optional, if it causes issues or isn't relevant to the test)
jest.mock('@/components/ui/glowing-effect', () => ({
  __esModule: true,
  GlowingEffect: jest.fn(({ children }) => <>{children}</>), // Simple pass-through
}));


// --- Test Data ---

const mockProductBase: CollectionProductNode = {
  id: 'gid://shopify/Product/12345',
  title: 'Test Product Title',
  handle: 'test-product-handle',
  availableForSale: true,
  totalInventory: 15,
  options: [],
  featuredImage: {
    url: 'https://example.com/test-image.jpg',
    altText: 'Test Alt Text',
  },
  compareAtPriceRange: {
    minVariantPrice: {
      amount: '20.00',
      currencyCode: 'USD',
    },
  },
  priceRange: {
    minVariantPrice: {
      amount: '15.00',
      currencyCode: 'USD',
    },
  },
  variants: {
    edges: [
      {
        node: {
          id: 'gid://shopify/ProductVariant/67890',
          availableForSale: true,
          selectedOptions: [],
        },
      },
    ],
  },
};

// --- Tests ---

describe('ProductCard Component', () => {
  it('should render basic product information correctly', () => {
    render(<ProductCard product={mockProductBase} />);

    // Check title
    expect(screen.getByText(mockProductBase.title)).toBeInTheDocument();

    // Check price (adjust regex to match CODE AMOUNT format)
    const priceCode = mockProductBase.priceRange.minVariantPrice.currencyCode;
    const priceAmount = mockProductBase.priceRange.minVariantPrice.amount;
    // Use non-capturing group for optional decimal part, match whitespace
    const priceRegex = new RegExp(`${priceCode}\\s*${parseFloat(priceAmount).toString()}(?:\\.00)?`);
    expect(screen.getByText(priceRegex)).toBeInTheDocument();


    // Check link href
    const linkElement = screen.getByRole('link');
    expect(linkElement).toHaveAttribute('href', `/products/${mockProductBase.handle}`);

    // Check if mocked WishlistButton is rendered with correct variantId
    const wishlistButton = screen.getByTestId('mock-wishlist-button');
    expect(wishlistButton).toBeInTheDocument();
    expect(wishlistButton).toHaveAttribute('data-variant-id', mockProductBase.variants.edges[0].node.id);
  });

  it('should render the image when featuredImage is provided', () => {
    render(<ProductCard product={mockProductBase} />);
    const image = screen.getByAltText(mockProductBase.featuredImage?.altText ?? '');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', mockProductBase.featuredImage?.url);
  });

  it('should render the skeleton when featuredImage is not provided', () => {
    const productWithoutImage = {
      ...mockProductBase,
      featuredImage: null, // Simulate missing image
    };
    render(<ProductCard product={productWithoutImage} />);

    // Check for skeleton (assuming Skeleton component adds a specific role or testid)
    // If Skeleton doesn't have a specific role, we might need to adjust the query
    // or add a data-testid to the Skeleton component itself.
    // For now, let's check that the image is NOT present.
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    // A more robust check would involve querying the Skeleton component directly.
    // Example (if Skeleton had role="status" or similar):
    // expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should display compare-at price and discount badge when discounted', () => {
    // mockProductBase is already discounted
    render(<ProductCard product={mockProductBase} />);

    // Check compare-at price (strikethrough, adjust regex)
    const compareAtCode = mockProductBase.compareAtPriceRange.minVariantPrice.currencyCode;
    const compareAtAmount = mockProductBase.compareAtPriceRange.minVariantPrice.amount;
    const compareAtRegex = new RegExp(`${compareAtCode}\\s*${parseFloat(compareAtAmount).toString()}(?:\\.00)?`);
    const compareAtElement = screen.getByText(compareAtRegex);
    expect(compareAtElement).toBeInTheDocument();
    expect(compareAtElement).toHaveClass('line-through'); // Check for strikethrough style

    // Check discount badge (using text content)
    // Calculate expected percentage
    const expectedPercentage = Math.round(
      ((parseFloat(mockProductBase.compareAtPriceRange.minVariantPrice.amount) -
        parseFloat(mockProductBase.priceRange.minVariantPrice.amount)) /
        parseFloat(mockProductBase.compareAtPriceRange.minVariantPrice.amount)) *
        100
    );
    expect(screen.getByText(`${expectedPercentage}%`)).toBeInTheDocument();
    expect(screen.getByText('SAVE')).toBeInTheDocument();
  });

   it('should NOT display compare-at price or discount badge when not discounted', () => {
    const notDiscountedProduct = {
      ...mockProductBase,
      compareAtPriceRange: { // Make compare price same as price
        minVariantPrice: {
          amount: mockProductBase.priceRange.minVariantPrice.amount,
          currencyCode: mockProductBase.priceRange.minVariantPrice.currencyCode,
        },
      },
    };
    render(<ProductCard product={notDiscountedProduct} />);

    // Ensure compare-at price is NOT rendered with strikethrough (adjust regex)
    const compareAtCode = notDiscountedProduct.compareAtPriceRange.minVariantPrice.currencyCode;
    const compareAtAmount = notDiscountedProduct.compareAtPriceRange.minVariantPrice.amount;
    const compareAtRegex = new RegExp(`${compareAtCode}\\s*${parseFloat(compareAtAmount).toString()}(?:\\.00)?`);
    const compareAtElements = screen.queryAllByText(compareAtRegex);
    // Find if any element has line-through (should be none or just the regular price)
    const strikethroughElement = compareAtElements.find(el => el.classList.contains('line-through'));
    expect(strikethroughElement).toBeUndefined();


    // Ensure discount badge is NOT rendered
    expect(screen.queryByText(/%$/)).not.toBeInTheDocument(); // Check for percentage sign
    expect(screen.queryByText('SAVE')).not.toBeInTheDocument();
  });


  it('should display "Out of Stock" overlay when availableForSale is false', () => {
    const outOfStockProduct = {
      ...mockProductBase,
      availableForSale: false,
    };
    render(<ProductCard product={outOfStockProduct} />);
    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
    // Check for grayscale filter on image if image exists
    if (outOfStockProduct.featuredImage) {
       const image = screen.getByAltText(outOfStockProduct.featuredImage?.altText ?? '');
       expect(image).toHaveClass('filter grayscale');
    }
  });

  it('should display "Limited stock" indicator when inventory is low (6-10)', () => {
    const lowStockProduct = {
      ...mockProductBase,
      totalInventory: 7, // Between 6 and 10
      availableForSale: true,
    };
    render(<ProductCard product={lowStockProduct} />);
    expect(screen.getByText(/Limited stock/)).toBeInTheDocument();
    expect(screen.getByText(/7 left/)).toBeInTheDocument();
    expect(screen.queryByText('Out of Stock')).not.toBeInTheDocument();
  });

  it('should display "Last X remaining" indicator when inventory is critical (1-5)', () => {
    const criticalStockProduct = {
      ...mockProductBase,
      totalInventory: 3, // Between 1 and 5
      availableForSale: true,
    };
    render(<ProductCard product={criticalStockProduct} />);
    expect(screen.getByText(/Last 3 remaining/)).toBeInTheDocument();
    expect(screen.queryByText('Out of Stock')).not.toBeInTheDocument();
    expect(screen.queryByText(/Limited stock/)).not.toBeInTheDocument();
  });

   it('should not display any stock indicator when inventory is sufficient (>10)', () => {
    const sufficientStockProduct = {
      ...mockProductBase,
      totalInventory: 20, // More than 10
      availableForSale: true,
    };
    render(<ProductCard product={sufficientStockProduct} />);
    expect(screen.queryByText(/Limited stock/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Last \d+ remaining/)).not.toBeInTheDocument();
    expect(screen.queryByText('Out of Stock')).not.toBeInTheDocument();
  });

});

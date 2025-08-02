const fs = require('fs');
const path = require('path');

// List of all product handles found in collections
const productHandles = [
  'classic-t-shirt', 'mens-polo-shirt', 'mens-jeans', 'mens-jacket', 'mens-sneakers',
  'denim-jeans', 'womens-summer-dress', 'womens-blouse', 'womens-skirt', 'womens-heels',
  'new-t-shirt-design', 'trendy-hoodie', 'stylish-cap', 'graphic-socks', 'designer-backpack',
  'mens-casual-shirt', 'mens-formal-trousers', 'mens-leather-wallet', 'mens-sports-shorts', 'mens-running-shoes',
  'womens-casual-top', 'womens-leggings', 'womens-handbag', 'womens-sandals',
  'unisex-hoodie', 'classic-denim-jacket', 'comfortable-sweatpants', 'stylish-sunglasses', 'premium-leather-belt',
  'handcrafted-scarf', 'artisan-ceramic-mug', 'hand-painted-canvas', 'ethically-sourced-coffee', 'recycled-glass-vase',
  'kids-hoodie'
];

// Product templates with different categories
const productTemplates = {
  'classic-t-shirt': {
    id: 1, title: 'Classic T-Shirt', type: 'Apparel', tags: ['T-shirt', 'Classic', 'Cotton', 'Men'],
    description: 'A classic t-shirt made from 100% cotton. Perfect for everyday wear with a comfortable fit and timeless design.',
    price: '20.0', comparePrice: '25.0', inventory: 100
  },
  'mens-polo-shirt': {
    id: 11, title: "Men's Polo Shirt", type: 'Apparel', tags: ['Polo', 'Men', 'Cotton', 'Classic'],
    description: 'Classic polo shirt for men. Made from premium cotton with a comfortable collar design.',
    price: '35.0', comparePrice: '45.0', inventory: 80
  },
  'mens-jeans': {
    id: 12, title: "Men's Jeans", type: 'Apparel', tags: ['Jeans', 'Men', 'Denim', 'Casual'],
    description: 'Comfortable denim jeans for men. Classic fit with durable construction.',
    price: '55.0', comparePrice: '70.0', inventory: 70
  },
  'mens-jacket': {
    id: 13, title: "Men's Jacket", type: 'Apparel', tags: ['Jacket', 'Men', 'Outerwear', 'Warm'],
    description: 'Stylish jacket for men. Perfect for layering in cooler weather.',
    price: '85.0', comparePrice: '100.0', inventory: 50
  },
  'mens-sneakers': {
    id: 14, title: "Men's Sneakers", type: 'Footwear', tags: ['Sneakers', 'Men', 'Shoes', 'Casual'],
    description: 'Comfortable sneakers for men. Perfect for everyday wear and light activities.',
    price: '75.0', comparePrice: '90.0', inventory: 90
  },
  'denim-jeans': {
    id: 2, title: 'Denim Jeans', type: 'Apparel', tags: ['Jeans', 'Denim', 'Women', 'Casual'],
    description: 'Premium denim jeans with a modern fit. Made from high-quality denim fabric for durability and comfort.',
    price: '50.0', comparePrice: '60.0', inventory: 50
  },
  'womens-summer-dress': {
    id: 15, title: "Women's Summer Dress", type: 'Apparel', tags: ['Dress', 'Women', 'Summer', 'Elegant'],
    description: 'Light and breezy summer dress for women. Perfect for warm weather with a flattering fit.',
    price: '65.0', comparePrice: '80.0', inventory: 70
  },
  'womens-blouse': {
    id: 16, title: "Women's Blouse", type: 'Apparel', tags: ['Blouse', 'Women', 'Formal', 'Elegant'],
    description: 'Elegant blouse for women. Perfect for professional and formal occasions.',
    price: '45.0', comparePrice: '55.0', inventory: 90
  },
  'womens-skirt': {
    id: 17, title: "Women's Skirt", type: 'Apparel', tags: ['Skirt', 'Women', 'Formal', 'Elegant'],
    description: 'Stylish skirt for women. Versatile piece for various occasions.',
    price: '40.0', comparePrice: '50.0', inventory: 60
  },
  'womens-heels': {
    id: 18, title: "Women's Heels", type: 'Footwear', tags: ['Heels', 'Women', 'Shoes', 'Formal'],
    description: 'Elegant heels for women. Perfect for formal occasions and special events.',
    price: '95.0', comparePrice: '120.0', inventory: 40
  },
  'new-t-shirt-design': {
    id: 6, title: 'New T-Shirt Design', type: 'Apparel', tags: ['T-shirt', 'New', 'Design', 'Cotton'],
    description: 'Latest t-shirt design with modern graphics. Made from premium cotton for ultimate comfort.',
    price: '25.0', comparePrice: '30.0', inventory: 120
  },
  'trendy-hoodie': {
    id: 19, title: 'Trendy Hoodie', type: 'Apparel', tags: ['Hoodie', 'Trendy', 'Cotton', 'Casual'],
    description: 'Trendy hoodie with modern design. Comfortable and stylish for everyday wear.',
    price: '55.0', comparePrice: '70.0', inventory: 100
  },
  'stylish-cap': {
    id: 20, title: 'Stylish Cap', type: 'Accessories', tags: ['Cap', 'Hat', 'Stylish', 'Casual'],
    description: 'Stylish cap perfect for casual outings. Adjustable fit for maximum comfort.',
    price: '25.0', comparePrice: '30.0', inventory: 150
  },
  'graphic-socks': {
    id: 21, title: 'Graphic Socks', type: 'Accessories', tags: ['Socks', 'Graphic', 'Fun', 'Cotton'],
    description: 'Fun graphic socks with unique designs. Comfortable cotton blend material.',
    price: '15.0', comparePrice: '20.0', inventory: 200
  },
  'designer-backpack': {
    id: 22, title: 'Designer Backpack', type: 'Accessories', tags: ['Backpack', 'Designer', 'Travel', 'Durable'],
    description: 'Designer backpack with multiple compartments. Perfect for travel and daily use.',
    price: '120.0', comparePrice: '150.0', inventory: 60
  },
  'kids-hoodie': {
    id: 3, title: 'Kids Hoodie', type: 'Apparel', tags: ['Hoodie', 'Kids', 'Cotton', 'Warm'],
    description: 'Comfortable and warm hoodie for kids. Made from soft cotton blend fabric with a cozy hood.',
    price: '35.0', comparePrice: '40.0', inventory: 75
  }
};

// Generate a product object
function generateProduct(handle, index) {
  const template = productTemplates[handle];
  if (!template) {
    // Generate a default product if no template exists
    const id = 100 + index;
    const title = handle.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    return {
      product: {
        id: `gid://shopify/Product/${id}`,
        title: title,
        availableForSale: true,
        description: `High-quality ${title.toLowerCase()} with excellent craftsmanship and attention to detail.`,
        descriptionHtml: `<p>High-quality ${title.toLowerCase()} with excellent craftsmanship and attention to detail.</p>`,
        handle: handle,
        productType: 'Apparel',
        totalInventory: 50,
        tags: [title.split(' ')[0], 'Quality', 'Comfortable'],
        featuredImage: {
          url: `https://picsum.photos/seed/${handle}/400/600`,
          altText: title
        },
        images: {
          edges: [
            {
              cursor: "1",
              node: {
                url: `https://picsum.photos/seed/${handle}/400/600`,
                altText: title
              }
            }
          ]
        },
        options: [
          {
            id: "1",
            name: "Size",
            optionValues: [
              {"id": "1", "name": "S", "swatch": null},
              {"id": "2", "name": "M", "swatch": null},
              {"id": "3", "name": "L", "swatch": null}
            ]
          }
        ],
        variants: {
          edges: [
            {
              cursor: "1",
              node: {
                id: `gid://shopify/ProductVariant/${id}`,
                title: "M",
                availableForSale: true,
                quantityAvailable: 15,
                taxable: true,
                currentlyNotInStock: false,
                selectedOptions: [
                  {"name": "Size", "value": "M"}
                ],
                image: {
                  url: `https://picsum.photos/seed/${handle}/400/600`,
                  altText: title
                },
                price: {
                  amount: "45.0",
                  currencyCode: "INR"
                },
                compareAtPrice: {
                  amount: "55.0",
                  currencyCode: "INR"
                },
                product: {
                  id: `gid://shopify/Product/${id}`,
                  title: title,
                  handle: handle,
                  description: `High-quality ${title.toLowerCase()} with excellent craftsmanship and attention to detail.`,
                  seo: {
                    title: `${title} - Quality and Comfort`,
                    description: `Shop our high-quality ${title.toLowerCase()}. Excellent craftsmanship and attention to detail.`
                  },
                  featuredImage: {
                    url: `https://picsum.photos/seed/${handle}/400/600`,
                    altText: title
                  }
                }
              }
            }
          ]
        },
        seo: {
          title: `${title} - Quality and Comfort`,
          description: `Shop our high-quality ${title.toLowerCase()}. Excellent craftsmanship and attention to detail.`
        }
      }
    };
  }

  return {
    product: {
      id: `gid://shopify/Product/${template.id}`,
      title: template.title,
      availableForSale: true,
      description: template.description,
      descriptionHtml: `<p>${template.description}</p>`,
      handle: handle,
      productType: template.type,
      totalInventory: template.inventory,
      tags: template.tags,
      featuredImage: {
        url: `https://picsum.photos/seed/${handle}/400/600`,
        altText: template.title
      },
      images: {
        edges: [
          {
            cursor: "1",
            node: {
              url: `https://picsum.photos/seed/${handle}/400/600`,
              altText: template.title
            }
          }
        ]
      },
      options: [
        {
          id: "1",
          name: "Size",
          optionValues: [
            {"id": "1", "name": "S", "swatch": null},
            {"id": "2", "name": "M", "swatch": null},
            {"id": "3", "name": "L", "swatch": null},
            {"id": "4", "name": "XL", "swatch": null}
          ]
        }
      ],
      variants: {
        edges: [
          {
            cursor: "1",
            node: {
              id: `gid://shopify/ProductVariant/${template.id}`,
              title: "M",
              availableForSale: true,
              quantityAvailable: Math.floor(template.inventory / 4),
              taxable: true,
              currentlyNotInStock: false,
              selectedOptions: [
                {"name": "Size", "value": "M"}
              ],
              image: {
                url: `https://picsum.photos/seed/${handle}/400/600`,
                altText: template.title
              },
              price: {
                amount: template.price,
                currencyCode: "INR"
              },
              compareAtPrice: {
                amount: template.comparePrice,
                currencyCode: "INR"
              },
              product: {
                id: `gid://shopify/Product/${template.id}`,
                title: template.title,
                handle: handle,
                description: template.description,
                seo: {
                  title: `${template.title} - Quality and Style`,
                  description: template.description
                },
                featuredImage: {
                  url: `https://picsum.photos/seed/${handle}/400/600`,
                  altText: template.title
                }
              }
            }
          }
        ]
      },
      seo: {
        title: `${template.title} - Quality and Style`,
        description: template.description
      }
    }
  };
}

// Generate all products
const allProducts = productHandles.map((handle, index) => generateProduct(handle, index));

// Write to file
const outputPath = path.join(__dirname, '..', 'lib', 'mock-data', 'detailedProducts.json');
fs.writeFileSync(outputPath, JSON.stringify(allProducts, null, 2));

console.log(`Generated ${allProducts.length} products and saved to ${outputPath}`);

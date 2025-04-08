export interface SizeEntry {
  size: string
  chestInch: number
  lengthInch: number
}

export interface SizeChart {
  title: string
  sizes: SizeEntry[]
}

export interface CountrySizeCharts {
  [productType: string]: SizeChart | undefined
}

export interface SizeChartsMapping {
  [countryCode: string]: CountrySizeCharts | undefined
}

export const sizeCharts: SizeChartsMapping = {
  in: {
    'Unisex Classic T-Shirt': {
      title: 'Unisex Classic T-Shirt Size Chart',
      sizes: [
        { size: 'XS', chestInch: 36, lengthInch: 25 },
        { size: 'S', chestInch: 38, lengthInch: 26 },
        { size: 'M', chestInch: 40, lengthInch: 27 },
        { size: 'L', chestInch: 42, lengthInch: 28 },
        { size: 'XL', chestInch: 44, lengthInch: 29 },
        { size: 'XXL', chestInch: 46, lengthInch: 30 },
        { size: '3XL', chestInch: 48, lengthInch: 31 },
        { size: '4XL', chestInch: 50, lengthInch: 32 },
        { size: '5XL', chestInch: 52, lengthInch: 32 },
        { size: '6XL', chestInch: 56, lengthInch: 33 },
        { size: '7XL', chestInch: 60, lengthInch: 33 }
      ]
    },
    'Unisex Oversized T-Shirt': {
      title: 'Unisex Oversized T-Shirt Size Chart',
      sizes: [
        { size: 'XS', chestInch: 39, lengthInch: 27 },
        { size: 'S', chestInch: 41, lengthInch: 28 },
        { size: 'M', chestInch: 43, lengthInch: 29 },
        { size: 'L', chestInch: 45, lengthInch: 30 },
        { size: 'XL', chestInch: 47, lengthInch: 31 },
        { size: 'XXL', chestInch: 49, lengthInch: 32 }
      ]
    },
    'Crop Top': {
      title: 'Crop Top Size Chart',
      sizes: [
        { size: 'XS', chestInch: 32, lengthInch: 15.5 },
        { size: 'S', chestInch: 34, lengthInch: 16.5 },
        { size: 'M', chestInch: 36, lengthInch: 17.5 },
        { size: 'L', chestInch: 38, lengthInch: 18.5 },
        { size: 'XL', chestInch: 40, lengthInch: 19.5 },
        { size: 'XXL', chestInch: 42, lengthInch: 20.5 }
      ]
    }
  }
}

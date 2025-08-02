import getCollectionProductsJson from "../mock-data/getCollectionProducts.json";
import { CollectionNode } from "../types/collection";

export const getMockCollectionProducts = (): CollectionNode[] => {
  return getCollectionProductsJson as CollectionNode[];
};
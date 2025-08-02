declare module '@/lib/mock-data/menu.json' {
  interface ImageNode {
    url: string;
    altText: string | null;
  }

  interface CollectionResource {
    __typename: "Collection";
    id: string;
    title: string;
    handle: string;
    image: ImageNode | null;
  }

  interface MenuItem {
    title: string;
    url: string;
    resource: CollectionResource | null;
  }

  interface MenuData {
    menu: {
      handle: string;
      items: MenuItem[];
    };
  }

  const menu: MenuData;
  export default menu;
}
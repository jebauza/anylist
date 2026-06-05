export const CREATE_ITEM = `
  mutation CreateItem($createItemInput: CreateItemInput!) {
    createItem(createItemInput: $createItemInput) {
      id name unit
    }
  }
`;

export const ITEMS = `
  query Items($offset: Int, $limit: Int, $search: String) {
    items(offset: $offset, limit: $limit, search: $search) {
      id name unit
    }
  }
`;

export const ITEM = `
  query Item($id: ID!) {
    item(id: $id) {
      id name unit
    }
  }
`;

export const UPDATE_ITEM = `
  mutation UpdateItem($updateItemInput: UpdateItemInput!) {
    updateItem(updateItemInput: $updateItemInput) {
      id name unit
    }
  }
`;

export const REMOVE_ITEM = `
  mutation RemoveItem($id: ID!) {
    removeItem(id: $id) {
      id name
    }
  }
`;

export const CREATE_ITEM_LIST = `
  mutation CreateItemList($createItemListInput: CreateItemListInput!) {
    createItemList(createItemListInput: $createItemListInput) {
      id quantity completed
    }
  }
`;

export const ITEM_LIST = `
  query ItemList($id: ID!) {
    itemList(id: $id) {
      id quantity completed
    }
  }
`;

export const UPDATE_ITEM_LIST = `
  mutation UpdateItemList($updateItemListInput: UpdateItemListInput!) {
    updateItemList(updateItemListInput: $updateItemListInput) {
      id quantity completed
    }
  }
`;

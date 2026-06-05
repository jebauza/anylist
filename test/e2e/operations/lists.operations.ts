export const CREATE_LIST = `
  mutation CreateList($createListInput: CreateListInput!) {
    createList(createListInput: $createListInput) {
      id name
    }
  }
`;

export const LISTS = `
  query Lists($offset: Int, $limit: Int, $search: String) {
    lists(offset: $offset, limit: $limit, search: $search) {
      id name
    }
  }
`;

export const LIST = `
  query List($id: ID!) {
    list(id: $id) {
      id name
    }
  }
`;

export const UPDATE_LIST = `
  mutation UpdateList($updateListInput: UpdateListInput!) {
    updateList(updateListInput: $updateListInput) {
      id name
    }
  }
`;

export const REMOVE_LIST = `
  mutation RemoveList($id: ID!) {
    removeList(id: $id) {
      id name
    }
  }
`;

export const USERS = `
  query Users($offset: Int, $limit: Int, $roles: [ValidRoles!], $search: String) {
    users(offset: $offset, limit: $limit, roles: $roles, search: $search) {
      id email fullName roles isActive
    }
  }
`;

export const USER = `
  query User($id: ID!) {
    user(id: $id) {
      id email fullName roles isActive
    }
  }
`;

export const BLOCK_USER = `
  mutation BlockUser($id: ID!) {
    blockUser(id: $id) {
      id email isActive
    }
  }
`;

export const UPDATE_USER = `
  mutation UpdateUser($updateUserInput: UpdateUserInput!) {
    updateUser(updateUserInput: $updateUserInput) {
      id email fullName roles isActive
    }
  }
`;

export const SIGNUP = `
  mutation Signup($signupInput: SignupInput!) {
    signup(signupInput: $signupInput) {
      token
      user { id email fullName roles isActive }
    }
  }
`;

export const LOGIN = `
  mutation Login($loginInput: LoginInput!) {
    login(loginInput: $loginInput) {
      token
      user { id email }
    }
  }
`;

export const ME = `
  query Me {
    me {
      id email fullName roles isActive
    }
  }
`;

export const REVALIDATE_TOKEN = `
  query RevalidateToken {
    revaliteToken {
      token
      user { id email }
    }
  }
`;

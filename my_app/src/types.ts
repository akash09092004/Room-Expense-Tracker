export type UserRole = "admin" | "member" | string;

export interface AuthUser {
  _id?: string;
  name?: string;
  email?: string;
  role?: UserRole;
}

export interface Expense {
  _id: string;
  itemName: string;
  amount: number | string;
  category?: string;
  user?: {
    _id?: string;
    name?: string;
    email?: string;
    role?: UserRole;
  };
  userId?: {
    _id?: string;
    name?: string;
    email?: string;
  };
  createdAt?: string;
}

export interface Member {
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Group {
  inviteCode?: string;
  members?: Member[];
  admin?: AuthUser;
  isSettled?: boolean;
}

export interface UserNote {
  text: string;
  createdAt: string;
  updatedAt: string;
  linkedExpenseId?: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (token: string, userData: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
}

export type AuthStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
};

export type AppTabParamList = {
  Dashboard: undefined;
  Expenses: undefined;
  Settlement: undefined;
  Group: undefined;
};

export type GroupStackParamList = {
  GroupDetails: undefined;
  CreateGroup: undefined;
  JoinGroup: undefined;
};

export type AdminTabParamList = {
  AdminHome: undefined;
  Members: undefined;
  CloseMonth: undefined;
};

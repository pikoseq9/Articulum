// ✅ To musi być 'enum', żeby działało jako wartość (0, 1, 2) w kodzie
export enum BookStatus {
  ToRead = 0,
  Reading = 1,
  Read = 2
}

export const BookStatusLabels: Record<number, string> = {
  [BookStatus.ToRead]: "Do przeczytania",
  [BookStatus.Reading]: "W trakcie",
  [BookStatus.Read]: "Przeczytane"
};

export interface Book {
  id: string;
  title: string;
  author: string;
  year: number;
  cover: string;
  isbn?: string; 
  pages?: number
}

export interface UserBook {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  imageUrl?: string;
  description?: string;
  pages?: number;
  status: BookStatus;
  addedAt: string;
  appUserId?: string;
  currentPage?: number;
}

export interface BookCreateUpdate {
  title: string;
  author: string;
  isbn?: string;
  imageUrl?: string;
  description?: string;
  pages?: number;
  status: BookStatus;
}

export interface UserDto {
  displayName: string;
  userName: string;
  token: string;
  isMfaRequired: boolean;
  isMfaEnabled: boolean;
  mfaMethod?: "authenticator" | "email";
}
// types.ts

export enum BookStatus {
  ToRead = 0,
  Reading = 1,
  Read = 2
}

// Mapowanie statusów na czytelne etykiety (opcjonalne, przydatne w UI)
export const BookStatusLabels: Record<number, string> = {
  [BookStatus.ToRead]: "Do przeczytania",
  [BookStatus.Reading]: "W trakcie",
  [BookStatus.Read]: "Przeczytane"
};

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
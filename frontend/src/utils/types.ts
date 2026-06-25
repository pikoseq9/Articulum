export enum ArticleCategory {
  Mathematics = 1,
  ComputerScience = 2,
  Didactics = 3,
  PopularScience = 4,
}

export const CategoryLabels: Record<number, string> = {
  [ArticleCategory.Mathematics]: "Matematyka",
  [ArticleCategory.ComputerScience]: "Informatyka",
  [ArticleCategory.Didactics]: "Dydaktyka",
  [ArticleCategory.PopularScience]: "Popularyzacja nauki",
};

export interface Article {
  id: string;
  title: string;
  authors: string;
  pageRange: string;
  keywords: string;
  publicationDate: string;
  category: ArticleCategory;
  pdfFileName: string;
  additionalFileName?: string | null;
  openCount: number;
}

export interface UserDto {
  displayName: string;
  userName: string;
  email?: string;
  token: string;
  role?: string;
  avatarUrl?: string | null;

  isMfaRequired?: boolean;
  isMfaEnabled?: boolean;
  mfaMethod?: string | null;
  myGoal?: number;
}

export interface MfaDto {
  email: string;
  code: string;
}

export interface DisableMfaDto {
  code: string;
}

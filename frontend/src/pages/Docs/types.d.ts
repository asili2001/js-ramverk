export type Document = {
  id: number;
  title: string;
  previewImage?: string;
  usersWithAccess: UserWithAccess[];
};

export interface UserWithAccess extends User {
  accessLevel: 'viewer' | 'editor' | 'owner';
}

export interface FullDocument extends Document {
  content: string;
}

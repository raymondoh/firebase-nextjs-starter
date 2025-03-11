import { User } from "../user/common";

export type UserDocumentData = Omit<User, "id"> & {
  createdAt: Date;
  updatedAt: Date;
};

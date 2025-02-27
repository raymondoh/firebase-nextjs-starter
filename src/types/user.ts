// src/types/user.ts
// export type User = {
//   id: string;
//   name: string;
//   email: string;
//   image?: string;
//   role: "user" | "admin";
//   createdAt?: Date;
//   updatedAt?: Date;
// };

// export type UserRole = "user" | "admin";

export type User = {
  id: string;
  role?: string;
  name: string;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type UserRole = "user" | "admin";

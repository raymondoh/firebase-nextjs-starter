// utils/get-initials.ts
export const getInitials = (name: string | null | undefined): string => {
  if (!name) return "U";

  const parts = name.split(" ");
  if (parts.length === 1) return name.charAt(0).toUpperCase();

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

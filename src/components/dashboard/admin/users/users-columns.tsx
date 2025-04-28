// // "use client";

// // import type { ColumnDef } from "@tanstack/react-table";
// // import { ArrowUpDown, Shield, ShieldAlert, ShieldCheck, UserIcon } from "lucide-react";
// // import { Button } from "@/components/ui/button";
// // import { Badge } from "@/components/ui/badge";
// // import { formatDate } from "@/utils/date";
// // import type { SerializedUser } from "@/types/user/common";
// // import { UserRowActions } from "./UserRowActions";
// // import { UserAvatar } from "@/components/shared/UserAvatar";

// // type UserColumnActions = {
// //   onView?: (id: string) => void;
// //   // onDelete?: () => void;
// //   // onRefresh?: () => void;
// //   // onSuccess?: () => void;
// //   onRefreshData?: () => void; // <-- Change prop name here
// // };

// // function getRoleIcon(role: string | undefined) {
// //   switch (role) {
// //     case "admin":
// //       return <ShieldAlert className="h-4 w-4 text-destructive" />;
// //     case "moderator":
// //       return <ShieldCheck className="h-4 w-4 text-yellow-500" />;
// //     case "support":
// //       return <Shield className="h-4 w-4 text-muted-foreground" />;
// //     default:
// //       return <UserIcon className="h-4 w-4 text-muted-foreground" />;
// //   }
// // }

// // function RegisteredHeader({ column }: { column: any }) {
// //   return (
// //     <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
// //       Registered
// //       <ArrowUpDown className="ml-2 h-4 w-4" />
// //     </Button>
// //   );
// // }

// // export function getUserColumns({
// //   onView,
// //   onRefreshData // ✅ only this is needed now
// // }: UserColumnActions): ColumnDef<SerializedUser>[] {
// //   return [
// //     {
// //       accessorKey: "name",
// //       header: "User",
// //       cell: ({ row }) => {
// //         const user = row.original;
// //         console.log("[User Table] Row user data:", user);
// //         console.log("Rendering avatar for:", user.email, "Image:", user.image);

// //         return (
// //           <div className="flex items-center gap-3">
// //             <div
// //               className="h-10 w-10 rounded-full transition
// //               hover:ring-2 hover:ring-gray-700
// //               ring-offset-0 ring-0">
// //               <UserAvatar src={user?.image} name={user?.name} email={user?.email} className="h-10 w-10" />
// //             </div>
// //             <div className="flex flex-col">
// //               <span className="font-medium truncate max-w-[160px]">
// //                 {user.name || user.username || user.email?.split("@")[0] || "Unknown"}
// //               </span>
// //               <span className="text-xs text-muted-foreground truncate max-w-[160px]">{user.email}</span>
// //             </div>
// //           </div>
// //         );
// //       }
// //     },
// //     {
// //       accessorKey: "role",
// //       header: "Role",
// //       cell: ({ row }) => {
// //         const role = (row.getValue("role") as string) || "user";
// //         return (
// //           <div className="flex items-center gap-2">
// //             {getRoleIcon(role)}
// //             <Badge variant={role === "admin" ? "destructive" : role === "moderator" ? "outline" : "secondary"}>
// //               {role}
// //             </Badge>
// //           </div>
// //         );
// //       }
// //     },
// //     {
// //       accessorKey: "status",
// //       header: "Status",
// //       cell: ({ row }) => {
// //         const status = (row.getValue("status") as string) || "active";
// //         return (
// //           <Badge variant={status === "active" ? "default" : status === "disabled" ? "destructive" : "outline"}>
// //             {status}
// //           </Badge>
// //         );
// //       }
// //     },
// //     {
// //       accessorKey: "createdAt",
// //       header: RegisteredHeader,
// //       cell: ({ row }) => {
// //         const date = row.original.createdAt;
// //         return <span className="text-muted-foreground text-sm">{date ? formatDate(date) : "Unknown"}</span>;
// //       }
// //     },
// //     {
// //       accessorKey: "lastLoginAt",
// //       header: "Last Login",
// //       cell: ({ row }) => {
// //         const date = row.original.lastLoginAt;
// //         return (
// //           <span className="text-muted-foreground text-sm">{date ? formatDate(date, { relative: true }) : "N/A"}</span>
// //         );
// //       }
// //     },
// //     {
// //       id: "actions",
// //       cell: ({ row }) => {
// //         const user = row.original;
// //         return (
// //           <div className="text-right">
// //             <UserRowActions
// //               user={user}
// //               onActionSuccess={onRefreshData} // <-- Pass down (maybe rename again for clarity)
// //               onView={onView}
// //             />
// //           </div>
// //         );
// //       }
// //     }
// //   ];
// // }
// "use client";

// import type { ColumnDef } from "@tanstack/react-table";
// import { ArrowUpDown, Shield, ShieldAlert, ShieldCheck, UserIcon } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { formatDate } from "@/utils/date";
// import type { SerializedUser } from "@/types/user/common";
// import { UserRowActions } from "./UserRowActions";
// import { UserAvatar } from "@/components/shared/UserAvatar";

// type UserColumnActions = {
//   onView?: (id: string) => void;
//   onRefreshData?: () => void;
// };

// function getRoleIcon(role: string | undefined) {
//   switch (role) {
//     case "admin":
//       return <ShieldAlert className="h-4 w-4 text-destructive" />;
//     case "moderator":
//       return <ShieldCheck className="h-4 w-4 text-yellow-500" />;
//     case "support":
//       return <Shield className="h-4 w-4 text-muted-foreground" />;
//     default:
//       return <UserIcon className="h-4 w-4 text-muted-foreground" />;
//   }
// }

// function RegisteredHeader({ column }: { column: any }) {
//   return (
//     <Button
//       variant="ghost"
//       size="sm"
//       className="text-xs text-muted-foreground font-normal"
//       onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
//       Registered
//       <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
//     </Button>
//   );
// }

// export function getUserColumns({ onView, onRefreshData }: UserColumnActions): ColumnDef<SerializedUser>[] {
//   return [
//     {
//       accessorKey: "name",
//       header: "User",
//       cell: ({ row }) => {
//         const user = row.original;

//         return (
//           <div className="flex items-center gap-3">
//             <div className="h-10 w-10 rounded-full overflow-hidden">
//               <UserAvatar src={user?.image} name={user?.name} email={user?.email} className="h-10 w-10" />
//             </div>
//             <div className="flex flex-col">
//               <span className="font-medium truncate max-w-[140px]">{user.name || user.email}</span>
//               <span className="text-xs text-muted-foreground truncate max-w-[140px]">{user.email}</span>
//             </div>
//           </div>
//         );
//       }
//     },
//     {
//       accessorKey: "role",
//       header: "Role",
//       cell: ({ row }) => {
//         const role = (row.getValue("role") as string) || "user";
//         return (
//           <div className="flex items-center gap-1">
//             {getRoleIcon(role)}
//             <Badge
//               variant={role === "admin" ? "destructive" : role === "moderator" ? "outline" : "secondary"}
//               className="text-[10px] font-normal px-2">
//               {role}
//             </Badge>
//           </div>
//         );
//       },
//       size: 100
//     },
//     {
//       accessorKey: "status",
//       header: "Status",
//       cell: ({ row }) => {
//         const status = (row.getValue("status") as string) || "active";
//         return (
//           <Badge
//             variant={status === "active" ? "default" : status === "disabled" ? "destructive" : "outline"}
//             className="text-[10px] font-normal px-2">
//             {status}
//           </Badge>
//         );
//       },
//       size: 100
//     },
//     {
//       accessorKey: "createdAt",
//       header: RegisteredHeader,
//       cell: ({ row }) => {
//         const date = row.original.createdAt;
//         return <span className="text-xs text-muted-foreground">{date ? formatDate(date) : "Unknown"}</span>;
//       },
//       size: 120
//     },
//     {
//       accessorKey: "lastLoginAt",
//       header: "Last Login",
//       cell: ({ row }) => {
//         const date = row.original.lastLoginAt;
//         return (
//           <span className="text-xs text-muted-foreground">{date ? formatDate(date, { relative: true }) : "N/A"}</span>
//         );
//       },
//       size: 120
//     },
//     {
//       id: "actions",
//       cell: ({ row }) => {
//         const user = row.original;
//         return (
//           <div className="flex justify-end">
//             <UserRowActions user={user} onActionSuccess={onRefreshData} onView={onView} />
//           </div>
//         );
//       },
//       size: 80
//     }
//   ];
// }
// First, utility function to determine row background class
// function getUserRowClass(user: SerializedUser) {
//   if (user.role === "admin") return "bg-red-50";
//   if (user.role === "moderator") return "bg-yellow-50";
//   if (user.status === "disabled") return "bg-gray-100";
//   return ""; // default (no highlight)
// }

// Updated getUserColumns file
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Shield, ShieldAlert, ShieldCheck, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/date";
import type { SerializedUser } from "@/types/user/common";
import { UserRowActions } from "./UserRowActions";
import { UserAvatar } from "@/components/shared/UserAvatar";

type UserColumnActions = {
  onView?: (id: string) => void;
  onRefreshData?: () => void;
};

function getRoleIcon(role: string | undefined) {
  switch (role) {
    case "admin":
      return <ShieldAlert className="h-4 w-4 text-destructive" />;
    case "moderator":
      return <ShieldCheck className="h-4 w-4 text-yellow-500" />;
    case "support":
      return <Shield className="h-4 w-4 text-muted-foreground" />;
    default:
      return <UserIcon className="h-4 w-4 text-muted-foreground" />;
  }
}

function RegisteredHeader({ column }: { column: any }) {
  return (
    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
      Registered
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
}

export function getUserColumns({ onView, onRefreshData }: UserColumnActions): ColumnDef<SerializedUser>[] {
  return [
    {
      accessorKey: "name",
      header: "User",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full hover:ring-2 hover:ring-gray-700">
              <UserAvatar src={user?.image} name={user?.name} email={user?.email} className="h-10 w-10" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium truncate max-w-[160px]">
                {user.name || user.username || user.email?.split("@")[0] || "Unknown"}
              </span>
              <span className="text-xs text-muted-foreground truncate max-w-[160px]">{user.email}</span>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = (row.getValue("role") as string) || "user";
        return (
          <div className="flex items-center gap-2">
            {getRoleIcon(role)}
            <Badge variant={role === "admin" ? "destructive" : role === "moderator" ? "outline" : "secondary"}>
              {role}
            </Badge>
          </div>
        );
      }
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = (row.getValue("status") as string) || "active";
        return (
          <Badge variant={status === "active" ? "default" : status === "disabled" ? "destructive" : "outline"}>
            {status}
          </Badge>
        );
      }
    },
    {
      accessorKey: "createdAt",
      header: RegisteredHeader,
      cell: ({ row }) => {
        const date = row.original.createdAt;
        return <span className="text-muted-foreground text-sm">{date ? formatDate(date) : "Unknown"}</span>;
      }
    },
    {
      accessorKey: "lastLoginAt",
      header: "Last Login",
      cell: ({ row }) => {
        const date = row.original.lastLoginAt;
        return (
          <span className="text-muted-foreground text-sm">{date ? formatDate(date, { relative: true }) : "N/A"}</span>
        );
      }
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="text-right">
            <UserRowActions user={user} onActionSuccess={onRefreshData} onView={onView} />
          </div>
        );
      }
    }
  ];
}

// Don't forget to apply `className={getUserRowClass(user)}` in your TableRow!
export function getUserRowClass(user: SerializedUser) {
  if (user.role === "admin") return "bg-destructive/10";
  if (user.role === "moderator") return "bg-yellow-100/10";
  if (user.status === "disabled") return "opacity-60";
  return "";
}

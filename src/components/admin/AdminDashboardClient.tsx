// // components/admin/AdminDashboardClient.tsx
// "use client";

// import { useState } from "react";
// import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import { auth } from "@/auth";

// type User = {
//   id: string;
//   name: string;
//   email: string;
//   role: string;
//   isActive?: boolean;
//   createdAt: string | null;
//   updatedAt: string | null;
// };

// type AdminDashboardClientProps = {
//   users: User[];
//   lastVisible?: string;
// };

// export function AdminDashboardClient({ users: initialUsers, lastVisible }: AdminDashboardClientProps) {
//   const { data: session, status } = useSession();
//   const [users, setUsers] = useState(initialUsers);
//   const router = useRouter();

//   if (status === "loading") {
//     return <div className="flex justify-center items-center h-screen">Loading...</div>;
//   }

//   if (!session || session.user.role !== "admin") {
//     router.push("/unauthorized");
//     return null;
//   }

//   const totalUsers = users.length;
//   const activeUsers = users.filter(user => user.isActive).length;

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//         <div className="bg-white p-4 rounded-lg shadow">
//           <h2 className="text-xl font-semibold mb-2 text-black">Total Users</h2>
//           <p className="text-3xl font-bold text-black">{totalUsers}</p>
//         </div>
//         <div className="bg-white p-4 rounded-lg shadow">
//           <h2 className="text-xl font-semibold mb-2 text-black">Active Users</h2>
//           <p className="text-3xl font-bold text-black">{activeUsers}</p>
//         </div>
//       </div>
//       <div className="bg-white p-6 rounded-lg shadow">
//         <h2 className="text-2xl font-semibold mb-4">User List</h2>
//         <div className="overflow-x-auto">
//           <table className="min-w-full table-auto">
//             <thead className="bg-gray-200 text-black">
//               <tr>
//                 <th className="px-4 py-2 text-left">Name</th>
//                 <th className="px-4 py-2 text-left">Email</th>
//                 <th className="px-4 py-2 text-left">Role</th>
//                 <th className="px-4 py-2 text-left">Status</th>
//                 <th className="px-4 py-2 text-left">Created At</th>
//               </tr>
//             </thead>
//             <tbody>
//               {users.map(user => (
//                 <tr key={user.id} className="border-b">
//                   <td className="px-4 py-2 text-black">{user.name || "N/A"}</td>
//                   <td className="px-4 py-2 text-black">{user.email}</td>
//                   <td className="px-4 py-2 text-black">{user.role}</td>
//                   <td className="px-4 py-2 text-black">
//                     <span
//                       className={`px-2 py-1 rounded ${
//                         user.isActive ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
//                       }`}>
//                       {user.isActive ? "Active" : "Inactive"}
//                     </span>
//                   </td>
//                   <td className="px-4 py-2 text-black">
//                     {user.createdAt ? new Date(user.createdAt).toLocaleString() : "N/A"}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }

import React from "react";

export const AdminDashboardClient = () => {
  return <div>AdminDashboardClient</div>;
};

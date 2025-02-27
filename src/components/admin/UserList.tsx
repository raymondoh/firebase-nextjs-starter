type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive?: boolean;
  createdAt: string | null;
  updatedAt: string | null;
};

type UserListProps = {
  users: User[];
};

export function UserList({ users }: UserListProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">User List</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-200 text-black">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Created At</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b">
                <td className="px-4 py-2 text-black">{user.name || "N/A"}</td>
                <td className="px-4 py-2 text-black">{user.email}</td>
                <td className="px-4 py-2 text-black">{user.role}</td>
                <td className="px-4 py-2 text-black">
                  <span
                    className={`px-2 py-1 rounded ${
                      user.isActive ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
                    }`}>
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-2 text-black">
                  {user.createdAt ? new Date(user.createdAt).toLocaleString() : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

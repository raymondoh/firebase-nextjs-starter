type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive?: boolean;
  createdAt: string | null;
  updatedAt: string | null;
};

type DashboardStatsProps = {
  users: User[];
};

export function DashboardStats({ users }: DashboardStatsProps) {
  const totalUsers = users.length;
  const activeUsers = users.filter(user => user.isActive).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2 text-black">Total Users</h2>
        <p className="text-3xl font-bold text-black">{totalUsers}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2 text-black">Active Users</h2>
        <p className="text-3xl font-bold text-black">{activeUsers}</p>
      </div>
    </div>
  );
}

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const recentActivities = [
  {
    id: 1,
    user: {
      name: "John Doe",
      email: "john@example.com",
      avatar: "/avatars/01.png"
    },
    activity: "Logged in",
    timestamp: "2 minutes ago"
  },
  {
    id: 2,
    user: {
      name: "Jane Smith",
      email: "jane@example.com",
      avatar: "/avatars/02.png"
    },
    activity: "Updated profile",
    timestamp: "1 hour ago"
  },
  {
    id: 3,
    user: {
      name: "Bob Johnson",
      email: "bob@example.com",
      avatar: "/avatars/03.png"
    },
    activity: "Uploaded a document",
    timestamp: "3 hours ago"
  },
  {
    id: 4,
    user: {
      name: "Alice Brown",
      email: "alice@example.com",
      avatar: "/avatars/04.png"
    },
    activity: "Changed password",
    timestamp: "5 hours ago"
  },
  {
    id: 5,
    user: {
      name: "Charlie Wilson",
      email: "charlie@example.com",
      avatar: "/avatars/05.png"
    },
    activity: "Submitted a form",
    timestamp: "1 day ago"
  }
];

export function RecentActivity() {
  return (
    <div className="space-y-8">
      {recentActivities.map(item => (
        <div key={item.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={item.user.avatar} alt={item.user.name} />
            <AvatarFallback>{item.user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{item.user.name}</p>
            <p className="text-sm text-muted-foreground">{item.activity}</p>
          </div>
          <div className="ml-auto font-medium text-sm text-muted-foreground">{item.timestamp}</div>
        </div>
      ))}
    </div>
  );
}

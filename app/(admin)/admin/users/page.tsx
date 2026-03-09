import { requireRole } from "@/server/auth/session";
import { listAllUsers } from "@/server/admin/service";
import { UserTable } from "./UserTable";

export default async function UserManagementPage() {
  await requireRole("ADMIN");
  const users = await listAllUsers();

  return <UserTable initialUsers={users} />;
}

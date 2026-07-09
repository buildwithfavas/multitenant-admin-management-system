"use client";
import { DataTable } from "@/components/ui/data-table";
import { getUserColumns, UserRow, Organization } from "./user-columns";
import { CreateUserDialog } from "./create-user-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
interface UsersDashboardProps {
    users: UserRow[];
    organizations: Organization[];
}
export function UsersDashboard({ users, organizations }: UsersDashboardProps) {
    const columns = getUserColumns(organizations);
    return (<div className="flex flex-col gap-8 p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Users</h1>
          <p className="text-muted-foreground mt-1">
            Manage users across all organizations ({users.length} total)
          </p>
        </div>
        <CreateUserDialog organizations={organizations}/>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-5 text-muted-foreground"/>
            Users Directory
          </CardTitle>
          <CardDescription>
            Search, paginate, and click actions to edit, delete or promote/demote users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={users} searchKey="email" placeholder="Search users by email..."/>
        </CardContent>
      </Card>
    </div>);
}

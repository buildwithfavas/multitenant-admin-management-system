# 📚 Study Guide — Multi-Tenant Admin Management System

> **This guide was written for you as an intern** to understand every concept used in this project.
> Each section is written in simple language with examples.
> Read each section as we complete the corresponding phase!

---

## Table of Contents

1. [What is pnpm?](#1-what-is-pnpm)
2. [What is Next.js and App Router?](#2-what-is-nextjs-and-app-router)
3. [What are Environment Variables?](#3-what-are-environment-variables)
4. [What is PostgreSQL?](#4-what-is-postgresql)
5. [What is Prisma ORM?](#5-what-is-prisma-orm)
6. [What is Better Auth?](#6-what-is-better-auth)
7. [Better Auth Admin Plugin](#7-better-auth-admin-plugin)
8. [Better Auth Organization Plugin](#8-better-auth-organization-plugin)
9. [What is Zod?](#9-what-is-zod)
10. [What is React Hook Form?](#10-what-is-react-hook-form)
11. [What is next-safe-action?](#11-what-is-next-safe-action)
12. [Server vs Client Components](#12-server-vs-client-components)
13. [What is Middleware?](#13-what-is-middleware)
14. [What is RBAC?](#14-what-is-rbac)
15. [What is Multi-tenancy?](#15-what-is-multi-tenancy)
16. [What is Shadcn UI?](#16-what-is-shadcn-ui)
17. [How All Pieces Connect](#17-how-all-pieces-connect)

---

## 1. What is pnpm?

### The Simple Answer
**pnpm** stands for "performant npm". It's a **package manager** — a tool that installs code libraries (called "packages" or "dependencies") that your project needs to run.

### Why not just use npm?
There are 3 package managers for Node.js:
- `npm` — the original, comes with Node.js
- `yarn` — faster than npm, popular for a while
- `pnpm` — the fastest, uses less disk space ✅

### How pnpm saves disk space
When you install a package (e.g., `react`), `npm` copies it into every project's `node_modules` folder.

**npm (wasteful):**
```
project-a/node_modules/react  ← copy 1 (40MB)
project-b/node_modules/react  ← copy 2 (40MB)
project-c/node_modules/react  ← copy 3 (40MB)
Total: 120MB for the same package!
```

**pnpm (smart):**
```
~/.pnpm-store/react  ← single copy (40MB)
project-a/node_modules/react  ← just a link pointing to the store
project-b/node_modules/react  ← just a link pointing to the store
project-c/node_modules/react  ← just a link pointing to the store
Total: 40MB saved 3x!
```

### Commands you'll use
| Command | What it does |
|---------|-------------|
| `pnpm install` | Install all packages listed in `package.json` |
| `pnpm add react` | Install a new package |
| `pnpm add -D typescript` | Install as dev-only dependency |
| `pnpm run dev` | Run the dev server |
| `pnpm dlx shadcn@latest add button` | Run a tool without installing it globally |

> **`pnpm dlx` vs `npx`:** Both run tools without permanent install. `pnpm dlx` uses pnpm's store for speed.

---

## 2. What is Next.js and App Router?

### The Simple Answer
**Next.js** is a framework built on top of React. React builds interactive UI, but Next.js adds:
- **File-based routing** — the file structure = the URL structure
- **Server-side rendering** — render pages on the server for speed and SEO
- **API routes** — build backend endpoints inside the same project
- **Middleware** — run code before a request reaches a page

### The App Router
Next.js 13+ introduced the **App Router** — a new way to structure pages using the `app/` folder.

**File → URL mapping:**
```
app/page.tsx                    → /
app/login/page.tsx              → /login
app/superadmin/dashboard/page.tsx → /superadmin/dashboard
app/api/auth/[...all]/route.ts  → /api/auth/* (all subpaths)
```

### Route Groups with `(parentheses)`
Folders wrapped in `()` are **route groups** — they organize files but DON'T become part of the URL.

```
app/(auth)/login/page.tsx     → URL is just /login (not /auth/login)
app/(protected)/admin/page.tsx → URL is just /admin
```

This lets you apply different **layouts** to different page groups.

### `page.tsx` vs `layout.tsx`
- **`page.tsx`** — The actual content of a route
- **`layout.tsx`** — A wrapper shared by multiple pages (like a sidebar or navbar)

```
app/(protected)/layout.tsx     ← Sidebar + navbar for all protected pages
app/(protected)/admin/page.tsx ← Admin page content
app/(protected)/staff/page.tsx ← Staff page content (both share the layout!)
```

---

## 3. What are Environment Variables?

### The Simple Answer
Environment variables are **secret configuration values** stored outside your code.

### Why not just put them in code?
```typescript
// ❌ BAD — never do this!
const db = new Database("postgresql://admin:password123@myserver.com/mydb");
```
If you push this to GitHub, your password is **public forever**.

```typescript
// ✅ GOOD — use environment variables
const db = new Database(process.env.DATABASE_URL);
```

### The `.env` file
```env
DATABASE_URL="postgresql://admin:password123@myserver.com/mydb"
BETTER_AUTH_SECRET="abc123secretkey"
```
This file is added to `.gitignore` so it's **never committed to git**.

### `NEXT_PUBLIC_` prefix
- `DATABASE_URL` — only available on the SERVER (safe for secrets)
- `NEXT_PUBLIC_APP_URL` — available on BOTH server and browser (public, no secrets!)

---

## 4. What is PostgreSQL?

### The Simple Answer
**PostgreSQL** (often called "Postgres") is a **relational database** — it stores data in tables (like Excel spreadsheets), where rows are records and columns are fields.

### Example: Our `user` table
```
id          | email              | name    | role
------------|--------------------|---------|-----------
user_abc123 | admin@company.com  | Alice   | superadmin
user_def456 | bob@acme.com       | Bob     | admin
user_ghi789 | charlie@acme.com   | Charlie | member
```

### Why relational?
Tables can **relate** to each other. For example:
- A `member` row says: "User Bob belongs to Organization Acme with role admin"
- This links the `user` table and the `organization` table

### Connection String
```
postgresql://username:password@hostname:5432/database_name
│             │        │         │       │    └─ DB name
│             │        │         │       └─ Port (default: 5432)
│             │        │         └─ Server address
│             │        └─ Password
│             └─ Username
└─ Protocol
```

---

## 5. What is Prisma ORM?

### The Simple Answer
**Prisma** is an ORM (Object-Relational Mapper). It lets you talk to your database using TypeScript instead of raw SQL.

### Without Prisma (raw SQL)
```typescript
const result = await db.query(
  `SELECT u.id, u.email, u.name 
   FROM "user" u 
   JOIN "member" m ON m."userId" = u.id 
   WHERE m."organizationId" = $1 AND m.role = 'member'`,
  [orgId]
);
```

### With Prisma
```typescript
const staffMembers = await prisma.member.findMany({
  where: {
    organizationId: orgId,
    role: "member",
  },
  include: {
    user: true, // Join the user table automatically!
  },
});
```
Much cleaner, and **fully type-safe** — TypeScript knows exactly what fields each result has.

### Prisma Schema (`prisma/schema.prisma`)
The schema is like a blueprint of your database:

```prisma
model User {
  id    String @id @default(cuid())
  email String @unique
  name  String
  role  String @default("member")
  
  // A user can be a member of many organizations
  members Member[]
}

model Organization {
  id      String   @id @default(cuid())
  name    String
  slug    String   @unique
  
  // An organization has many members
  members Member[]
}

model Member {
  id             String       @id @default(cuid())
  userId         String
  organizationId String
  role           String       @default("member") // owner, admin, member
  
  user         User         @relation(fields: [userId], references: [id])
  organization Organization @relation(fields: [organizationId], references: [id])
}
```

### Migrations
When you change the schema, Prisma creates a **migration** — a script that updates the actual database:
```bash
pnpm prisma migrate dev --name "add-user-role"
```
This creates a file like `prisma/migrations/20240101_add_user_role/migration.sql` that permanently records the change.

---

## 6. What is Better Auth?

### The Simple Answer
**Better Auth** is a library that handles **authentication** (who you are) and **authorization** (what you're allowed to do) in your Next.js app.

### What authentication means
When a user logs in with email + password:
1. Better Auth checks if the email exists in the database
2. Verifies the password matches the stored (hashed) password
3. Creates a **session** — a token stored in a browser cookie
4. Every future request sends that cookie, so the server knows who you are

### Session vs JWT
**Session (what we use):**
- Server stores session data in the database
- Browser holds a tiny "session ID" cookie
- More secure — server can revoke sessions anytime

**JWT (JSON Web Token):**
- All user data is encoded in the token itself
- Browser holds the full token
- Faster (no DB lookup) but harder to revoke

### The Two Parts of Better Auth

**Server side** (`lib/auth.ts`):
```typescript
export const auth = betterAuth({
  database: ...,    // Where to store sessions
  plugins: [...],   // Admin + Organization features
  emailAndPassword: { enabled: true }
});
```

**Client side** (`lib/auth-client.ts`):
```typescript
export const authClient = createAuthClient({
  plugins: [adminClient(), organizationClient()]
});

// Usage in a React component:
const { data: session } = authClient.useSession();
```

---

## 7. Better Auth Admin Plugin

### What it does
The **admin plugin** adds a `role` column to the `user` table and provides admin-only API functions:

```typescript
import { admin } from "better-auth/plugins";

// Added to auth config:
plugins: [admin()]
```

### Role field in User
```
user table (after admin plugin):
id | email           | name  | role        | banned | banReason
---|-----------------|-------|-------------|--------|----------
1  | sa@company.com  | Alice | superadmin  | false  | null
2  | admin@acme.com  | Bob   | admin       | false  | null
3  | staff@acme.com  | Carol | member      | false  | null
```

### Admin Actions available
```typescript
// Create a user with a role
await authClient.admin.createUser({
  email: "newadmin@org.com",
  password: "password123",
  name: "New Admin",
  role: "admin",
});

// Change a user's role
await authClient.admin.setRole({
  userId: "user_abc123",
  role: "member",
});

// Ban a user
await authClient.admin.banUser({ userId: "user_abc123" });
```

### Who can call admin functions?
Only users whose `role` is in `adminRoles` config (we set `["superadmin", "admin"]`).

---

## 8. Better Auth Organization Plugin

### What it does
The **organization plugin** adds multi-tenancy — users can belong to different organizations with different roles.

```typescript
import { organization } from "better-auth/plugins";

plugins: [organization({
  allowUserToCreateOrganization: false, // only superadmin creates orgs
})]
```

### New tables it creates
```
organization: id | name | slug | metadata
member:       id | userId | organizationId | role (owner/admin/member)
invitation:   id | email | organizationId | role | status
```

### Organization Roles
| Role | What they can do |
|------|-----------------|
| `owner` | Full control, can delete org |
| `admin` | Manage members, can't delete org |
| `member` | Just a member (this = Staff in our system) |

### How we map to our roles
| Our Role | Better Auth mechanism |
|----------|----------------------|
| Super Admin | `user.role = "superadmin"` (admin plugin) |
| Org Admin | `member.role = "admin"` in their org (org plugin) |
| Staff | `member.role = "member"` in their org (org plugin) |

---

## 9. What is Zod?

### The Simple Answer
**Zod** is a TypeScript library for **data validation**. It lets you define the "shape" of data and check if incoming data matches that shape.

### Without Zod
```typescript
function createUser(data: any) {
  // What if email is missing? What if password is too short?
  // You have to write all checks manually...
  if (!data.email) throw new Error("Email required");
  if (!data.email.includes("@")) throw new Error("Invalid email");
  if (!data.password || data.password.length < 8) throw new Error("Too short");
}
```

### With Zod
```typescript
import { z } from "zod";

const createUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required"),
  role: z.enum(["admin", "member"]), // must be one of these values
});

function createUser(data: unknown) {
  const validated = createUserSchema.parse(data); // throws if invalid!
  // Now `validated` is fully type-safe
}
```

### Form Validation Example
When a user submits a login form:
1. Zod schema defines the rules
2. React Hook Form uses Zod to validate before submitting
3. Nice error messages appear next to the fields automatically

---

## 10. What is React Hook Form?

### The Simple Answer
**React Hook Form** (RHF) is a library that makes building forms in React much easier. It handles:
- Tracking which fields have values
- Tracking which fields have been "touched" (focused then blurred)
- Running validation (with Zod!)
- Submitting the form

### Without React Hook Form (painful)
```typescript
function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!email.includes("@")) {
      setEmailError("Invalid email");
      return;
    }
    setIsLoading(true);
    // ... submit logic
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      {emailError && <p>{emailError}</p>}
      ...
    </form>
  );
}
```

### With React Hook Form + Zod (clean!)
```typescript
const form = useForm({
  resolver: zodResolver(loginSchema),  // Zod handles all validation!
});

return (
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <input {...form.register("email")} />
    {form.formState.errors.email && (
      <p>{form.formState.errors.email.message}</p>
    )}
  </form>
);
```

---

## 11. What is next-safe-action?

### The Simple Answer
**next-safe-action** is a library that makes **Next.js Server Actions** type-safe and adds middleware support.

### What are Server Actions?
In Next.js 14+, instead of creating separate API endpoints, you can write functions that run **on the server** and call them directly from client components!

```typescript
// This function runs on the SERVER
"use server";
async function createOrg(name: string) {
  await prisma.organization.create({ data: { name } });
}

// Called from a CLIENT component
<button onClick={() => createOrg("My Company")}>Create</button>
```

### Why next-safe-action?
Regular server actions have a problem — **no automatic validation**. Someone could call the action with garbage data directly.

**next-safe-action adds:**
1. **Zod validation** — validates input before your code runs
2. **Authentication middleware** — checks if user is logged in
3. **Role checking** — checks if user has permission
4. **Type-safe responses** — TypeScript knows exactly what the action returns

```typescript
// Define the action
export const createOrganizationAction = superAdminAction
  .schema(z.object({ name: z.string().min(1), slug: z.string() }))
  .action(async ({ parsedInput, ctx }) => {
    // parsedInput is fully validated and typed!
    // ctx.user has the logged-in user
    return await createOrg(parsedInput.name, parsedInput.slug);
  });

// Use it in a component
const { execute, result, status } = useAction(createOrganizationAction);
```

---

## 12. Server vs Client Components

### The Key Rule
In Next.js App Router, **all components are Server Components by default**.
Add `"use client"` at the top to make a Client Component.

| | Server Component | Client Component |
|--|-----------------|-----------------|
| Runs on | Server only | Browser (also pre-rendered on server) |
| Can fetch data | ✅ Yes (direct DB access) | ⚠️ Only via API calls |
| Can use hooks (useState, useEffect) | ❌ No | ✅ Yes |
| Can handle events (onClick) | ❌ No | ✅ Yes |
| Access to browser APIs | ❌ No | ✅ Yes |

### When to use which?

**Use Server Component for:**
- Pages that fetch data from the database
- Layouts
- Static content

```typescript
// app/superadmin/users/page.tsx
// NO "use client" = Server Component
export default async function UsersPage() {
  const users = await prisma.user.findMany(); // Direct DB access!
  return <UserTable users={users} />;
}
```

**Use Client Component for:**
- Forms (need `onChange`, `onSubmit`)
- Interactive elements (modals, dropdowns, tabs)
- Things that change based on user interaction

```typescript
"use client"; // ← This makes it a Client Component
export default function LoginForm() {
  const [email, setEmail] = useState("");
  // ...
}
```

---

## 13. What is Middleware?

### The Simple Answer
**Middleware** is code that runs **before** every request reaches a page or API route.

Think of it like a security guard at a building entrance — before you can enter any room, you pass through the guard first.

### Our Middleware Logic
```
User requests /superadmin/users
         ↓
    middleware.ts runs
         ↓
    Is user logged in?
    No → redirect to /login
    Yes → What's their role?
         ↓
    role === "superadmin"? → Allow through ✅
    role === "admin"?      → Redirect to /admin ❌
    role === "member"?     → Redirect to /staff ❌
```

### How it works in code
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  // Not logged in → go to login
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Trying to access superadmin but not superadmin
  if (request.nextUrl.pathname.startsWith("/superadmin")) {
    if (session.user.role !== "superadmin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  return NextResponse.next(); // Allow through
}
```

---

## 14. What is RBAC?

### The Simple Answer
**RBAC** stands for **Role-Based Access Control**. Instead of giving permissions to individual users, you assign them a **role**, and roles have permissions.

### Our Role Hierarchy
```
Super Admin
    │
    ├─ Can: Create organizations
    ├─ Can: Create any user (admin or staff) in any org
    ├─ Can: View all users across all orgs
    ├─ Can: Promote staff → admin
    └─ Can: Demote admin → staff
    
Admin (per organization)
    │
    ├─ Can: View staff in THEIR org only
    ├─ Can: Add staff to THEIR org
    ├─ Can: Promote staff → admin in THEIR org
    └─ Can: Demote admin → staff in THEIR org
    
Staff (per organization)
    │
    └─ Can: View their own dashboard only
```

### Why RBAC?
Without RBAC, you'd have to check permissions like:
```typescript
if (userId === "admin_alice" || userId === "admin_bob" || ...) {
  // allow
}
```

With RBAC:
```typescript
if (user.role === "admin") {
  // allow — clean and maintainable!
}
```

---

## 15. What is Multi-tenancy?

### The Simple Answer
**Multi-tenancy** means a single application serves **multiple independent organizations** (tenants), with each org's data isolated from others.

### Real-world analogy
Think of an apartment building:
- **Building** = the application
- **Apartments** = organizations  
- **Tenants** = users within each org
- Each tenant can only access their own apartment, not neighbors'

### How we implement it
Every database query for org-specific data is **scoped by organization ID**:

```typescript
// ❌ Wrong — shows ALL members from ALL orgs
const allMembers = await prisma.member.findMany();

// ✅ Correct — only shows members from the admin's org
const orgMembers = await prisma.member.findMany({
  where: {
    organizationId: currentAdmin.organizationId, // scoped!
  },
});
```

### Data isolation table
| Data | Super Admin can see | Org Admin can see | Staff can see |
|------|--------------------|--------------------|---------------|
| All orgs | ✅ | ❌ (only their org) | ❌ |
| All users | ✅ | ❌ (only their org's) | ❌ |
| Org details | ✅ | ✅ (own org only) | ✅ (own org only) |
| Own profile | ✅ | ✅ | ✅ |

---

## 16. What is Shadcn UI?

### The Simple Answer
**Shadcn UI** is a collection of beautiful, pre-built UI components for React. Unlike other component libraries, **it copies the code directly into your project** — you own and can fully customize every component.

### How to add components
```bash
pnpm dlx shadcn@latest add button
# → Creates src/components/ui/button.tsx
```

### Components we use
| Component | Used for |
|-----------|---------|
| `Button` | All buttons |
| `Form` | Form containers with React Hook Form integration |
| `Input` | Text inputs |
| `Table` | User/org listing tables |
| `Dialog` | Modal popups (create user, etc.) |
| `Select` | Dropdowns (role selector) |
| `Badge` | Role badges (Admin, Staff, etc.) |
| `Card` | Dashboard stat cards |
| `Sidebar` | Navigation sidebar |

### Shadcn Blocks
Shadcn also has **blocks** — complete page templates:
```bash
pnpm dlx shadcn@latest add login-01
# → Creates a full login page with email/password form
```

---

## 17. How All Pieces Connect

Here's the complete flow of what happens when an Admin logs in and views their staff list:

```
1. BROWSER: Admin fills login form (React Hook Form + Zod validates)
         ↓
2. CLIENT: Calls authClient.signIn.email({ email, password })
         ↓
3. NETWORK: POST /api/auth/sign-in
         ↓
4. SERVER (Better Auth handler): Verifies email/password against DB
         ↓
5. DATABASE (Prisma + PostgreSQL): SELECT * FROM user WHERE email = '...'
         ↓
6. SERVER: Creates session, sets cookie in response
         ↓
7. BROWSER: Receives cookie, redirects to /admin/dashboard
         ↓
8. MIDDLEWARE: Reads cookie, checks role = "admin" → allows through
         ↓
9. SERVER COMPONENT (admin/staff/page.tsx): Fetches staff list from DB
         ↓
10. DATABASE: SELECT members + users WHERE organizationId = '...'
         ↓
11. BROWSER: Renders the staff list table using Shadcn UI components
```

Every step has a specific tool doing its job. Together they create a secure, type-safe, multi-tenant admin system!

---

*This guide will continue to be updated as we complete each phase.*

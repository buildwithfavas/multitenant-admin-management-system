# Next.js Admin Management Portal

A modern Next.js admin management portal template styled with Tailwind CSS, shadcn/ui, and powered by Prisma and Better Auth.

---

## 🚀 Getting Started

Follow these steps to set up your environment, initialize the database, and run the development server.

### Prerequisites

- **Node.js** (v20+ recommended)
- **pnpm** (Package Manager)

### Step-by-Step Setup

1. **Install Dependencies**
   Install the required Node.js packages:
   ```bash
   pnpm install
   ```

2. **Generate Prisma Client**
   Compile and generate the type-safe Prisma client based on the database schema:
   ```bash
   pnpm db:generate
   ```

3. **Push Database Schema**
   Apply the Prisma schema to your PostgreSQL database. Ensure the `DATABASE_URL` is set correctly in your `.env` file:
   ```bash
   pnpm db:push
   ```

4. **Seed the Database**
   Populate the database with the default Super Admin credentials:
   ```bash
   pnpm db:seed
   ```
   🔑 **Default Credentials:**
   - **Email:** `superadmin@admin.com`
   - **Password:** `SuperAdmin@123`

5. **Run the Development Server**
   Start the local development server:
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---
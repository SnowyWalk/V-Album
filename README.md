# V-Album

V-Album is a collaborative digital album platform that allows users to create groups, upload photos, and share memories. The project consists of a modern React/Next.js frontend and a robust ASP.NET Core backend.

## 🚀 Overview

- **Frontend**: A responsive web application built with Next.js 16 and React 19.
- **Backend**: A RESTful API service powered by .NET 9 and Entity Framework Core.
- **Authentication**: Integrated with Google OAuth for secure user identification.

---

## 🏗️ Project Structure

This is a monorepo containing both the frontend and backend applications:

```text
v-album/
├── app/                # Next.js App Router (Frontend)
├── components/         # Reusable UI components (Shadcn UI)
├── lib/                # Shared utilities and configurations
├── public/             # Static assets
├── V-Album-Server/     # ASP.NET Core 9 (Backend)
│   ├── Controllers/    # API Controllers
│   ├── Domains/        # Entity models and business logic
│   ├── Infrastructures/# DB Context and migrations
│   └── Services/       # Business services
└── ...
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **State Management**: [TanStack Query v5](https://tanstack.com/query)
- **Authentication**: [NextAuth.js v4](https://next-auth.js.org/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) / Radix UI

### Backend
- **Runtime**: [.NET 9](https://dotnet.microsoft.com/)
- **Framework**: ASP.NET Core Web API
- **ORM**: Entity Framework Core
- **Database**: MySQL
- **Tooling**: JetBrains HTTP Client for API testing

---

## ⚙️ Requirements

- **Node.js**: v20 or later
- **.NET SDK**: 9.0 or later
- **Database**: MySQL 8.0+
- **Package Manager**: npm (standard for this project)

---

## 🚀 Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/your-repo/v-album.git
cd v-album
```

### 2. Frontend Setup
```bash
# Install dependencies
npm install

# Create environment file
# Note: Manually create .env.local with the following variables
```

Edit `.env.local` with the following variables:
- `NEXTAUTH_SECRET`: Random string for encryption
- `NEXTAUTH_URL`: `http://localhost:3000`
- `BACKEND_BASE_URL`: `http://localhost:5117`
- `GOOGLE_CLIENT_ID`: Your Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET`: Your Google OAuth Client Secret

### 3. Backend Setup
Navigate to the backend directory and configure the database.

```bash
cd V-Album-Server
# Edit appsettings.json with your MySQL connection string
```

Update `ConnectionStrings:Main` in `V-Album-Server/appsettings.json`:
`"Server=localhost;Port=3306;Database=v_album;User=root;Password=your_password;"`

---

## 🏃 Scripts & Running

### Frontend
```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint for code quality
```

### Backend
```bash
dotnet build V-Album-Server           # Build project
dotnet run --project V-Album-Server    # Run server (localhost:5117)
```

---

## 🧪 Testing

### API Testing (Recommended)
Use the JetBrains IDE HTTP Client with the provided `.http` files:
- `V-Album-Server/V-Album-Server.http`: Contains endpoint examples.

**Example Request:**
```http
GET http://localhost:5117/api/user/me
X-Google-Sub: <TEST_GOOGLE_SUB_ID>
Accept: application/json
```

---

## 🔐 Authentication Flow
1. **Frontend**: NextAuth handles Google OAuth login.
2. **Identification**: Upon login, the `sub` (Subject ID) from Google is retrieved.
3. **Backend Communication**: The frontend passes this ID in the `X-Google-Sub` header for all API requests to identify the user.

---

## 📄 License

MIT (Project contains MIT licensed dependencies; verify root LICENSE file if available).

---

## 📝 TODOs
- [ ] Add deployment documentation for production environments.
- [ ] Implement automated CI/CD pipelines.
- [ ] Add unit and integration tests for frontend/backend.

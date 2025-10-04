# ExpenseHub - Professional Expense Management System

A comprehensive, enterprise-grade expense management system built with modern web technologies. Streamline expense submission, tracking, and approval workflows with multi-currency support and advanced approval rules.

## 🚀 Features

- **Multi-Currency Support**: Submit expenses in your local currency (USD, INR, EUR, etc.)
- **Role-Based Access Control**: Admin, Manager, and Employee roles with appropriate permissions
- **Advanced Approval Workflows**: Sequential and conditional approval rules
- **Manager-Employee Relationships**: Automatic routing of expenses to assigned managers
- **Real-time Status Tracking**: Monitor expense status from submission to approval
- **Professional UI**: Clean, business-focused interface designed for enterprise use
- **PostgreSQL Database**: Robust data persistence with Prisma ORM
- **RESTful API**: Express.js backend with comprehensive endpoints

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, Radix UI, Tailwind CSS
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based session management
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/AviMath2412/expense-flow-quest.git
cd expense-flow-quest
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
DATABASE_URL="your_postgresql_connection_string"
```

### 4. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Seed initial data
npm run db:seed
```

### 5. Start the Application

```bash
# Start the backend server
npm run server

# In a new terminal, start the frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:8080
- Backend API: http://localhost:3001

## 👥 Demo Accounts

- **Admin**: admin@techcorp.com
- **Manager**: manager@techcorp.com  
- **Employee**: employee@techcorp.com

Password: any value (for demo purposes)

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── DashboardLayout.tsx
├── pages/              # Application pages
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   ├── Users.tsx
│   ├── Expenses.tsx
│   ├── Approvals.tsx
│   └── ApprovalRules.tsx
├── lib/                # Utilities and API clients
│   ├── api-client.ts   # Frontend API client
│   ├── auth.ts         # Authentication logic
│   └── utils.ts        # Helper functions
├── types/              # TypeScript type definitions
└── hooks/              # Custom React hooks
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run server` - Start backend server
- `npm run server:dev` - Start backend with auto-reload
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with initial data

## 🌍 Multi-Currency Support

The system automatically assigns currency based on employee country:
- **United States**: USD ($)
- **India**: INR (₹)
- **United Kingdom**: GBP (£)
- **European Union**: EUR (€)
- **Canada**: CAD (C$)
- **Australia**: AUD (A$)

## 📊 Approval Workflows

### Sequential Approval
Expenses flow through approvers in a defined sequence (e.g., Manager → Finance → Director).

### Conditional Approval
- **Percentage Rule**: Expense approved when X% of approvers approve
- **Specific Approver Rule**: Auto-approval when specific role approves
- **Hybrid Rules**: Combination of sequential and conditional logic

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- SQL injection protection via Prisma ORM
- CORS configuration for API security

## 📱 Responsive Design

The application is fully responsive and works seamlessly across:
- Desktop computers
- Tablets
- Mobile devices

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions, please open an issue in the GitHub repository.

---

**ExpenseHub** - Streamlining expense management for modern businesses.
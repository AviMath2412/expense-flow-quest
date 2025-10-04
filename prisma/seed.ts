import { PrismaClient } from '@prisma/client'
import { countryCurrencyMap } from '../src/lib/mockData'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create company
  const company = await prisma.company.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      name: 'TechCorp Inc.',
      country: 'United States',
      currency: 'USD',
    },
  })

  console.log('✅ Company created:', company.name)

  // Create users
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@techcorp.com' },
    update: {},
    create: {
      id: '1',
      email: 'admin@techcorp.com',
      name: 'Admin User',
      role: 'admin',
      department: 'Administration',
      country: 'United States',
      currency: 'USD',
      hireDate: new Date('2020-01-15'),
    },
  })

  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@techcorp.com' },
    update: {},
    create: {
      id: '2',
      email: 'manager@techcorp.com',
      name: 'Manager User',
      role: 'manager',
      department: 'Sales',
      country: 'United States',
      currency: 'USD',
      hireDate: new Date('2021-03-10'),
    },
  })

  const employeeUser = await prisma.user.upsert({
    where: { email: 'employee@techcorp.com' },
    update: {},
    create: {
      id: '3',
      email: 'employee@techcorp.com',
      name: 'Employee User',
      role: 'employee',
      department: 'Sales',
      country: 'India',
      currency: 'INR',
      managerId: managerUser.id,
      hireDate: new Date('2022-06-20'),
    },
  })

  console.log('✅ Users created:', { adminUser: adminUser.name, managerUser: managerUser.name, employeeUser: employeeUser.name })

  // Create sample expenses
  const expense1 = await prisma.expense.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      userId: employeeUser.id,
      submitDate: new Date('2024-01-15'),
      totalAmount: 450.00,
      currency: 'INR',
      description: 'Client dinner and transportation',
      status: 'pending',
      items: {
        create: [
          {
            id: '1',
            amount: 350.00,
            date: new Date('2024-01-14'),
            description: 'Business dinner with client',
            category: 'Meals',
            currency: 'INR',
          },
          {
            id: '2',
            amount: 100.00,
            date: new Date('2024-01-14'),
            description: 'Taxi to meeting',
            category: 'Transportation',
            currency: 'INR',
          },
        ],
      },
      receipts: {
        create: [
          {
            id: '1',
            filePath: '/receipts/receipt1.pdf',
            uploadDate: new Date('2024-01-15'),
          },
        ],
      },
    },
  })

  const expense2 = await prisma.expense.upsert({
    where: { id: '2' },
    update: {},
    create: {
      id: '2',
      userId: employeeUser.id,
      submitDate: new Date('2024-01-10'),
      totalAmount: 1200.00,
      currency: 'INR',
      description: 'Conference attendance',
      status: 'approved',
      items: {
        create: [
          {
            id: '3',
            amount: 800.00,
            date: new Date('2024-01-08'),
            description: 'Conference registration',
            category: 'Training',
            currency: 'INR',
          },
          {
            id: '4',
            amount: 400.00,
            date: new Date('2024-01-08'),
            description: 'Hotel accommodation',
            category: 'Lodging',
            currency: 'INR',
          },
        ],
      },
      receipts: {
        create: [
          {
            id: '2',
            filePath: '/receipts/receipt2.pdf',
            uploadDate: new Date('2024-01-10'),
          },
        ],
      },
      approvalActions: {
        create: [
          {
            id: '1',
            userId: managerUser.id,
            userName: managerUser.name,
            actionType: 'approved',
            actionDate: new Date('2024-01-11'),
            comments: 'Approved for business development',
          },
        ],
      },
    },
  })

  const expense3 = await prisma.expense.upsert({
    where: { id: '3' },
    update: {},
    create: {
      id: '3',
      userId: employeeUser.id,
      submitDate: new Date('2024-01-05'),
      totalAmount: 75.00,
      currency: 'INR',
      description: 'Office supplies',
      status: 'rejected',
      items: {
        create: [
          {
            id: '5',
            amount: 75.00,
            date: new Date('2024-01-04'),
            description: 'Notebooks and pens',
            category: 'Office Supplies',
            currency: 'INR',
          },
        ],
      },
      receipts: {
        create: [
          {
            id: '3',
            filePath: '/receipts/receipt3.pdf',
            uploadDate: new Date('2024-01-05'),
          },
        ],
      },
      approvalActions: {
        create: [
          {
            id: '2',
            userId: managerUser.id,
            userName: managerUser.name,
            actionType: 'rejected',
            actionDate: new Date('2024-01-06'),
            comments: 'Should be purchased through company account',
          },
        ],
      },
    },
  })

  console.log('✅ Sample expenses created:', { expense1: expense1.description, expense2: expense2.description, expense3: expense3.description })

  console.log('🎉 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

const { PrismaClient, Prisma } = require('@prisma/client');
const {
    invoices,
    customers,
    revenue,
    users,
  } = require('../app/lib/placeholder-data.js');

const bcrypt = require('bcrypt');

const prisma = new PrismaClient()

async function seedUsers() {
  try{

    const insertedUsers = await Promise.all(
        
        users.map(async (user) => {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            
            const createUser = await prisma.user.create({
                data : {
                    name: user.name,
                    email: user.email,
                    password: hashedPassword,
                }
            })
        })
    );

    console.log(`Seeded ${insertedUsers.length} users`);

  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
}

async function seedInvoices() {
    try{

        const insertedInvoices = await Promise.all(
        
            invoices.map(async (invoice) => {

                const createInvoice = await prisma.invoice.create({
                    data : {
                        amount: invoice.amount,
                        status: invoice.status,
                        date: invoice.date,
                        customerId: invoice.customer_id,
                    }
                })
            })
        );
    
        console.log(`Seeded ${insertedInvoices.length} invoices`);

    } catch (error) {
      console.error('Error seeding invoices:', error);
      throw error;
    }
}

async function seedCustomers(){
    try{

        const insertedCustomers = await Promise.all(
        
            customers.map(async (customer) => {

                const createCustomers = await prisma.customer.create({
                    data : {
                        name: customer.name,
                        email: customer.email,
                        image_url: customer.image_url,
                    }
                })
            })
        );
    
        console.log(`Seeded ${insertedCustomers.length} customer`);

    } catch (error) {
      console.error('Error seeding invoices:', error);
      throw error;
    }
}

async function seedRevenue(){
    try{

        const insertedRevenue = await Promise.all(
        
            revenue.map(async (revenue) => {

                const createRevenue = await prisma.revenue.create({
                    data : {
                        month: revenue.month, 
                        revenue: revenue.revenue
                    }
                })
            })
        );
    
        console.log(`Seeded ${insertedRevenue.length} customer`);

    } catch (error) {
      console.error('Error seeding invoices:', error);
      throw error;
    }
}


async function main() {
    await seedUsers();
    await seedCustomers();
    await seedInvoices();
    await seedRevenue();
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(
            'An error occurred while attempting to seed the database:',
            e,
        );
        await prisma.$disconnect()
        process.exit(1)
    })
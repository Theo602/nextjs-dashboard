import prisma from './prisma';
import {
  CustomerField,
  CustomersTable,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw
} from './definitions';
import { formatCurrency } from './utils';
import { unstable_noStore  as noStore } from 'next/cache';
import { type } from 'os';

export async function fetchRevenue() {
  noStore();

  try {

    console.log('Fetching revenue data...');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const data = await prisma.revenue.findMany();
    console.log('Data fetch complete after 3 seconds.');

    return data;
    
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLatestInvoices() {
  noStore();

  try {

    const data = await prisma.$queryRaw<LatestInvoiceRaw[]>`
          SELECT invoice.amount, customer.name, customer.image_url, customer.email
          FROM invoice
          JOIN customer ON invoice.customerId = customer.id
          ORDER BY invoice.date DESC
          LIMIT 5`;
    
    const latestInvoices = data.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));

    return latestInvoices;

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function fetchCardData() {
  noStore();

  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const invoiceCountPromise = await prisma.invoice.count();
    const customerCountPromise = await prisma.customer.count();
    
    const invoiceStatusPromise = await prisma.$queryRaw<any>`SELECT
         SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
         SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
         FROM invoice`;

    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);

    const numberOfInvoices = Number(data[0] ?? '0');
    const numberOfCustomers = Number(data[1] ?? '0');
    const totalPaidInvoices = formatCurrency(data[2][0].paid ?? '0');
    const totalPendingInvoices = formatCurrency(data[2][0].pending ?? '0');

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to card data.');
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  noStore();
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoices = await prisma.$queryRaw<InvoicesTable[]>`
      SELECT
        invoice.id,
        invoice.amount,
        invoice.date,
        invoice.status,
        customer.name,
        customer.email,
        customer.image_url
      FROM invoice
      JOIN customer ON invoice.customerId = customer.id
      WHERE
        customer.name LIKE ${`%${query}%`} OR
        customer.email LIKE ${`%${query}%`} OR
        invoice.amount LIKE ${`%${query}%`} OR
        invoice.date LIKE ${`%${query}%`} OR
        invoice.status LIKE ${`%${query}%`}
      ORDER BY invoice.date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return invoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query: string) {
  noStore();
 
  try {
    
    const count = await prisma.$queryRaw<any>`SELECT COUNT(*) AS count
    FROM invoice
    JOIN customer ON invoice.customerId = customer.id
    WHERE
      customer.name LIKE ${`%${query}%`} OR
      customer.email LIKE ${`%${query}%`} OR
      invoice.amount LIKE ${`%${query}%`} OR
      invoice.date LIKE ${`%${query}%`} OR
      invoice.status LIKE ${`%${query}%`}
 
  `;

    const totalPages = Math.ceil(Number(count[0].count) / ITEMS_PER_PAGE);

    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: string) {
  noStore();
  try {
    const data = await prisma.$queryRaw<InvoiceForm[]>`
      SELECT
        invoice.id,
        invoice.customerId,
        invoice.amount,
        invoice.status
      FROM invoice
      WHERE invoice.id = ${id};
    `;

    const invoice = data.map((invoice) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
    }));

    return invoice[0];
  } catch (error) {
    console.error('Database Error:', error);
  }
}

export async function fetchCustomers() {
  try {
    const data = await prisma.$queryRaw<CustomerField[]>`
      SELECT
        id,
        name
      FROM customer
      ORDER BY name ASC
    `;

    const customers = data;
    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchFilteredCustomers(query: string) {
  try {
    const data = await prisma.$queryRaw<CustomersTable[]>`
		SELECT
		  customer.id,
		  customer.name,
		  customer.email,
		  customer.image_url,
		  COUNT(invoice.id) AS total_invoices,
		  SUM(CASE WHEN invoice.status = 'pending' THEN invoice.amount ELSE 0 END) AS total_pending,
		  SUM(CASE WHEN invoice.status = 'paid' THEN invoice.amount ELSE 0 END) AS total_paid
		FROM customer
		LEFT JOIN invoice ON customer.id = invoice.customerId
		WHERE
		  customer.name ILIKE ${`%${query}%`} OR
        customer.email ILIKE ${`%${query}%`}
		GROUP BY customer.id, customer.name, customer.email, customer.image_url
		ORDER BY customer.name ASC
	  `;

    const customers = data.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending),
      total_paid: formatCurrency(customer.total_paid),
    }));

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}

export async function getUser(email: string) {
  try {

    const user = await prisma.user.findMany({
      where: {
        email: email
      }
    })

    return user;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

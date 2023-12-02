'use server';

import { revalidatePath } from 'next/cache';
import prisma from './prisma';
import { z } from "zod";
import { redirect } from 'next/navigation';
 
const FormSchema = z.object({
    id: z.string(),
    customerId: z.coerce.number(),
    amount: z.coerce.number(),
    status: z.enum(['pending', 'paid']),
    date: z.string(),
});

const CreateInvoice = FormSchema.omit({id: true, date: true });
const UpdateInvoice = FormSchema.omit({id: true, date: true });

export async function createInvoice(formData: FormData) {
    
    const { customerId, amount, status } = CreateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];

    try{
        await prisma.invoice.create({
            data: {
                customerId: customerId,
                amount: amountInCents,
                status: status,
                date: date
            }
        });
    } catch(error) {
        return {
            message: 'Database Error: Failed to Create Invoice.',
        };
    }

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function updateInvoice(id: number, formData: FormData) {
    const { customerId, amount, status } = UpdateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    const amountInCents = amount * 100;

    try {

        await prisma.invoice.update({
            where: {
                id: id
            },
            data: {
                customerId: customerId,
                amount: amountInCents,
                status: status,
            }
        });

    } catch(error) {
        return {
            message: 'Database Error: Failed to Update Invoice.',
        };
    }
    
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: number) {
     
    try {
        await prisma.invoice.delete({
            where: {
                id: id
            }
        })
    } catch(error) {
        return {
            message: 'Database Error: Failed to Delete Invoice.',
        };
    }

    revalidatePath('/dashboard/invoices');
}
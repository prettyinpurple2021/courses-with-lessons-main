
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyUser() {
    const email = 'testuser_verify_v1@example.com';
    console.log(`Checking for user with email: ${email}`);

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (user) {
        console.log('✅ User found in database:');
        console.log(`ID: ${user.id}`);
        console.log(`Email: ${user.email}`);
        console.log(`Name: ${user.firstName} ${user.lastName}`);
        console.log(`Created At: ${user.createdAt}`);
    } else {
        console.error('❌ User NOT found in database.');
        process.exit(1);
    }
}

verifyUser()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

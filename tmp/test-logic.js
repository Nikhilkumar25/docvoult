const prisma = require('../lib/db').default;

async function testCreateFolder() {
    console.log('--- Testing Internal Folder Creation Logic ---');
    try {
        // We need a user ID. Let's find the first user in the DB.
        const user = await prisma.user.findFirst();
        if (!user) {
            console.log('❌ No user found in database. Please register first.');
            return;
        }
        console.log(`Found user: ${user.email} (${user.id})`);

        console.log('Attempting to create a test folder...');
        const folder = await prisma.folder.create({
            data: {
                name: 'Test Folder ' + Date.now(),
                userId: user.id
            }
        });
        console.log('✅ Folder created successfully:', folder.id);

        console.log('Attempting to delete test folder...');
        await prisma.folder.delete({ where: { id: folder.id } });
        console.log('✅ Folder deleted successfully');

    } catch (err) {
        console.error('❌ Error in creation logic:', err.message);
        if (err.code) console.error('Prisma Error Code:', err.code);
    } finally {
        await prisma.$disconnect();
    }
}

testCreateFolder();

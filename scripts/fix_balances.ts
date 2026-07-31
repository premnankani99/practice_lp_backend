import prisma from '../prismaClient';

async function main() {
    console.log("Resetting available_leaves to max 1 for all employees...");
    
    const profiles = await prisma.profiles.findMany({
        where: {
            available_leaves: {
                gt: 1
            }
        }
    });

    console.log(`Found ${profiles.length} profiles with > 1 available_leaves`);

    let updatedCount = 0;
    for (const p of profiles) {
        await prisma.profiles.update({
            where: { id: p.id },
            data: { available_leaves: 1 }
        });
        updatedCount++;
    }

    console.log(`Successfully reset available_leaves to 1 for ${updatedCount} profiles.`);
}

main()
    .then(() => process.exit(0))
    .catch(e => {
        console.error(e);
        process.exit(1);
    });

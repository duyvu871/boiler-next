import { Prisma, PrismaClient } from 'db/client';

const clientOptions = {
	log: [
		{
			emit: 'event',
			level: 'query',
		},
		{
			emit: 'stdout',
			level: 'error',
		},
		{
			emit: 'stdout',
			level: 'info',
		},
		{
			emit: 'stdout',
			level: 'warn',
		},
	],
} as Prisma.PrismaClientOptions;

const prismaClientSingleton = (): PrismaClient => {
	return new PrismaClient(clientOptions);
};

declare global {
	var prisma: undefined | PrismaClient;
	interface BigInt {	
		toJSON(): string;
	}
}

BigInt.prototype.toJSON = function (): string {
	return this.toString();
};

const prisma: PrismaClient = globalThis.prisma ?? prismaClientSingleton();


// log query time for prisma
// @ts-ignore
prisma.$on('query', (e: Prisma.QueryEvent) => {
	console.log(`Query ${e.target} took ${e.duration}ms`);
});

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

process.on('beforeExit', async () => {
	await prisma.$disconnect();
}).on('SIGINT', async () => {
	await prisma.$disconnect();
}).on('SIGTERM', async () => {
	await prisma.$disconnect();
}).on('SIGQUIT', async () => {
	await prisma.$disconnect();
});
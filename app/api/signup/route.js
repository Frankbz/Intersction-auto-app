import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient(); // remember to run "npx prisma generate" to generate the prisma client

export const POST = async (req) => {
    const body = await req.json(); // .body() for node.js and .json() for react(next).js
    const { name, email, password } = body;

    if (!name || !email || !password) {
        return new Response("Missing fields", { status: 400 });
    }

    const exist = await prisma.user.findUnique({
        where: {
            email: email,
        }
    });

    if (exist) {
        return new Response("Email already exists", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            hashedPassword
        }
    })
    
    return new Response(JSON.stringify(user), { status: 200 });
}
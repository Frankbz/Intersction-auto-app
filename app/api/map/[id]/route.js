import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const GET = async (req, {params}) => {
    try{
        const maps = await prisma.MapData.findMany({
            where: {
              userId: params.id,
            },
          });

        // console.log('backend', maps);
        return new Response(JSON.stringify(maps), { status: 200 });
    } catch (error) {
        console.log("error fetching the data ",error);
        return new Response("Error", { status: 400 });
    }
}
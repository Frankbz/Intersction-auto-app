import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const POST = async (req) => {
    const {mapName, geocodedLocations, pins, userID} = await req.json();
    console.log('backend', mapName, geocodedLocations, pins, userID);
    try {
        const map = await prisma.MapData.create({
            data: {
                name: mapName,
                geocodedLocations: JSON.stringify(geocodedLocations),
                pins: JSON.stringify(pins),
                user: { connect: { id: userID } },
              },
        });
        return new Response(JSON.stringify(map), { status: 200 });
    }
    catch (error) { 
        console.log(error);
        return new Response("Error", { status: 400 });
    }
}
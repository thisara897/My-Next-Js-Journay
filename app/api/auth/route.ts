import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(request : NextRequest){
    const body = await request.json();
    console.log(body);

    const user = await prisma.user.findFirst(
        {
            where : {
                email : body.email
            }
        }
)

}
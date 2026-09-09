import { NextRequest } from "next/server";
import {getUser} from "@/utils/authentication"

export function POST(request : NextRequest){

    const user = getUser(request)

    console.log("User :", user)

}
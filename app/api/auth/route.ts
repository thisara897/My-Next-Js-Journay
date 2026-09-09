import { NextRequest } from "next/server";

export function GET(request : NextRequest){
    const cookies = request.cookies.get("login-token")?.value

    console.log("Get request recieved at / api/products");
}
import prisma from "@/lib/prisma";
import { getUser, isPrivileged } from "@/utils/authentication";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request : NextRequest){

    const havePrivilege = await isPrivileged(request, "users:read")

    if(!havePrivilege){
        return NextResponse.json(
            {
                message : "you do not have the privilege to veiw users"
            },
            {
                status : 403
            }
        )
    }

    const pageNumberInString = request.nextUrl.searchParams.get("pageNumber") || "1"
    const pageSizeInString = request.nextUrl.searchParams.get("pageSize") || "10"
    
    const pageNumber = parseInt(pageNumberInString)
    const pageSize = parseInt(pageSizeInString)

    const userCount = await prisma.user.count()

    const totalPages = Math.ceil(userCount / pageSize)

    if(pageNumber > totalPages){
        return NextResponse.json(
            {
                message : "Page number exceeds total pages",
                totalPages : totalPages
            },
            {
                status : 400
            }
        )
    }

    const users = await prisma.user.findMany({
        skip : (pageNumber - 1) * pageSize,
        take : pageSize,
        select : {
            id : true,
            email : true,
            phone : true,
            firstName : true,
            lastName : true,
            role : true,
            status : true,
            createdAt : true,
            lastLogin : true,
            privilages : true,
            gender : true,
        }
    })

    return NextResponse.json(
        {
            message : "Users fetched successfully",
            users : users,
            pagination : {
                pageNumber : pageNumber,
                pageSize : pageSize,
                totalPages : totalPages,
                totalCount : userCount
            }
        }
    )
}

export async function POST(request : NextRequest) {

    const body = await request.json()

    if(body.email == null){
        return NextResponse.json(
            {
                message : "Email is required"
            },
            {
                status : 422
            }
        )
    }
    
    if(body.firstName == null){
        return NextResponse.json(
            {
                message : "first name is required"
            },
            {
                status : 422
            }
        )
    }

    if(body.lastName == null){
        return NextResponse.json(
            {
                message : "last name is required"
            },
            {
                status : 422
            }
        )
    }

    if(body.password == null){
        return NextResponse.json(
            {
                message : "Password is required"
            },
            {
                status : 422
            }
        )
    }

    const existingUser = await prisma.user.findUnique(
        {
            where : {
                email : body.email
            }
        }
    )



    if(existingUser != null){
        return NextResponse.json(
            {
                message : "User with  this email already exists"
            },
            {
                status : 409
            }
        )
    }

    const passwordHash = await bcrypt.hash(body.password, 12)

    await prisma.user.create({
        data : {
            email : body.email,
            firstName : body.firstName,
            lastName : body.lastName,
            password : passwordHash,
            phone : body.phone, 
        }
    })

    return NextResponse.json(
        {
            message : "User created successfully"
        },
        {
            status : 201
        }
    )

}

export async function PUT(request: NextRequest){

    const id = request.nextUrl.searchParams.get("id")

    const requestedUser = await getUser(request)

    if(requestedUser == null){
        return NextResponse.json(
            {
                message : "You are not logged in"
            },
            {
                status : 401
            }
        )
    }

    const body = await request.json()

    if(requestedUser.id != id){
        const user = await prisma.user.findUnique({
            where : {
                id : id || "000"
            }
        })

        if(user == null){
            return NextResponse.json(
                {
                    message : "User not found"
                },
                {
                    status : 404
                }
            )
        }

        await prisma.user.update({
            where : {
                id : id || "000"
            },
            data : {
                email : body.email || user.email,
                firstName : body.firstName || user.firstName,
                lastName : body.lastName || user.lastName,
                phone : body.phone || user.phone,
                profileImage : body.profileImage || user.profileImage // should be included in the token

            }


        })
        return NextResponse.json(
            {
                message : "User updated successfully"
            }
        )

    }else{
        const havePrivilege = await isPrivileged(request, "users:edit")

        if(!havePrivilege){
            return NextResponse.json(
                {
                    message : "You do not have the privillege to edit other users"
                },
                {
                    status : 403
                }
            )
        }
        const user = await prisma.user.findUnique({
            where : {
                id : id||"000"
            }
        })

        if(user == null){
            return NextResponse.json(
                {
                    message : "User not found"
                },
                {
                    status : 404
                }
            )
        }

        await prisma.user.update({
            where : {
                id : id||"000"
            },

            data : {
                email : body.email || user.email,
                firstName : body.firstName || user.firstName,
                lastName : body.lastName || user.lastName,
                phone : body.phone || user.phone,
                profileImage : body.profileImage || user.profileImage,
                role : body.role || user.role,
                status : body.status || user.status,
                privilages : body.privileges || user.privilages
            }
        })

        return NextResponse.json(
            {
                message : "User updated successfully"
            }
        )


    }
}
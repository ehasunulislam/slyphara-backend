import { prisma } from "../../../lib/prisma";

// get all user
const getAllUserFromDB = async() => {
    const getAllUser = await prisma.user.findMany({
        omit: {
            password: true
        }
    });

    return getAllUser
};



export const adminService = {
    getAllUserFromDB
}
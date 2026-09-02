import { prisma } from "../../../lib/prisma";

// get profile withing login user
const getProfileFormDB = async(userId: string) => {
    const profile = await prisma.profile.findUnique({
        where: {
            userId
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true
                }
            }
        }
    });

    return profile
};


export const profileService = {
    getProfileFormDB,
    // updatedProfileFormDB
}


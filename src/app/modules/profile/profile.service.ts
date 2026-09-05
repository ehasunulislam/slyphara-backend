import { prisma } from "../../../lib/prisma";
import { IUpdateProfile } from "./profile.interface";

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

// update profile within login user
const updatedProfileFormDB = async (userId: string, payload: IUpdateProfile) => {
  const profile = await prisma.profile.update({
    where: {
      userId,
    },

    data: {
      ...(payload.linkedin !== undefined && {
        linkedin: payload.linkedin,
      }),

      ...(payload.github !== undefined && {
        github: payload.github,
      }),

      ...(payload.studentIdCardNumber !== undefined && {
            studentIdCardNumber: payload.studentIdCardNumber
        }),

      ...(payload.institutionName !== undefined && {
        institutionName: payload.institutionName,
      }),

      isStudentVerified: true
    },

    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return profile;
};


export const profileService = {
    getProfileFormDB,
    updatedProfileFormDB
}


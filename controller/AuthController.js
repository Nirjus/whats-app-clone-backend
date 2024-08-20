import createError from "http-errors";
import { db } from "../utils/PrismaClient.js";

export const checkUser = async (
  req,
  res,
  next
) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw createError(404, "Email is required");
    }
    const useR = await db.user.findUnique({
      where: {
        email: email,
      },
    });
    if (!useR) {
      return res.status(201).json({
        status: false,
        message: "User not found",
      });
    } else {
      return res.status(201).json({
        status: true,
        message: "User found",
        useR,
      });
    }
  } catch (error) {
    next(createError(500, error));
  }
};

export const onBoardingUser = async (
  req,
  res,
  next
) => {
  try {
    const { email, name, about, avatar } = req.body;
    if (!email || !name || !avatar || !about) {
      throw createError(404, "please fill all the field");
    }
    const user = await db.user.create({
      data: {
        email: email,
        name: name,
        about: about,
        avatar: avatar,
      },
    });
    return res.status(201).json({
      message: "Successfull",
      status: true,
      user
    });
  } catch (error) {
    next(createError(500, error));
  }
};

export const getUser = async (
  req,
  res,
  next
) => {
  try {
    const email = req.query.email;
    const user = await db.user.findUnique({
      where: {
        email: email,
      },
    });
    if (!user) {
      throw createError(404, "User not found");
    }

    return res.status(201).json({
      success: true,
      message: "User return successfully",
      user,
    });
  } catch (error) {
    next(createError(500, error));
  }
};

export const getAllUsers = async (
  req,
  res,
  next
) => {
  try {
       const users = await db.user.findMany({
        orderBy:{
          name:"asc"
        },
        select:{
          id: true,
          name: true,
          email: true,
          avatar: true,
          about: true
        }
       });

       const userGroupByleter = {};

       users.forEach((user) => {
        const initialLetter = user.name?.charAt(0).toUpperCase();
        if(!userGroupByleter[initialLetter]){
               userGroupByleter[initialLetter] = [];
        }
        userGroupByleter[initialLetter].push(user);
       })
    return res.status(201).json({
      success: true,
      message: "User return successfully",
      userGroupByleter
    });
  } catch (error) {
    next(createError(500, error));
  }
};

// export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//         const user = await db.user.updateMany({
//           data:{
//            about:"Hello gyes"
//           }
//         })
//         res.status(201).json({
//           messge: "ok",
//           user
//         })
//   } catch (error: any) {
//      next(createError(500, error))
//   }
// }
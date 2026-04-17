//creating userID to uniquely identify each user

// import { Request, Response, NextFunction } from "express";
// // import { auth } from "../lib/auth.js";
// // import { fromNodeHeaders } from "better-auth/node";

// import { fromNodeHeaders } from "better-auth/node";
// import { auth } from "../lib/auth.js";

// export const protect = async (req:Request, res:Response, next:NextFunction) => {
//   try {
//     const session = await auth.api.getSession({
//       headers: fromNodeHeaders(req.headers),
//     });

//     if (!session?.user) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     req.userId = session.user.id;
//     next();
//   } catch (err) {
//     console.log(err);
//     return res.status(401).json({ message: "Auth failed" });
//   }
// };

import { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth.js";
import { fromNodeHeaders } from "better-auth/node";

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    console.log("SESSION DEBUG:", session);
    console.log("COOKIE:", req.headers.cookie);

    if (!session?.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.userId = session.user.id;

    next();
  } catch (error: any) {
    console.log(error);
    return res.status(401).json({
      message: error.message || "Unauthorized",
    });
  }
};

// export const protect = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     const session = await auth.api.getSession({
//       headers: fromNodeHeaders(req.headers),
//     });
//     if (!session || !session?.user) {
//       return res.status(401).json({
//         message: "Unauthorized User",
//       });
//     }

//     req.userId = session.user.id;

//     next();
//   } catch (error: any) {
//     console.log(error);
//     res.status(401).json({ message: error.code || error.message });
//   }
// };
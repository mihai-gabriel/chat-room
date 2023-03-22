import { Request, Response, Router } from "express";

const router = Router();

//
// // TODO: REFACTOR: This is as simple as I could make it
// router.post("/login", async (req: Request, res: Response) => {
//     const userCredentials = req.body;
//
//     console.log("user credentials:", userCredentials);
//
//     const user = userService.getUserByCredentials(
//         userCredentials.username,
//         userCredentials.password
//     );
//
//     console.log("user info", user);
//
//     if (user) {
//         res.status(200).send(
//             JSON.stringify({
//                 userId: user.id,
//                 username: user.username,
//                 message: "OK",
//             })
//         );
//     } else {
//         res.status(403).send({ message: "Auth failed" });
//     }
// });
//
// router.post("/register", async (req: Request, res: Response) => {
//     const userAccountInfo: UserDB = {
//         username: req.body.username,
//         password: req.body.password,
//     };
//
//     const userCreated = await userService.addUser(userAccountInfo);
//
//     if (!userCreated) {
//         res.status(400).send({ message: "Error creating the account" });
//     }
//
//     res.status(201).send({ message: "OK", user: userCreated });
// });

export default router;

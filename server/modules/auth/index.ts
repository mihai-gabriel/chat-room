import bcrypt from "bcrypt";
import { Request, Response, Router } from "express";
import { Room, User, UserDb } from "../../types";
import * as HttpStatus from "../../utils/httpStatusCodes";
import databaseClient from "../../db/conn";
import { WithId } from "mongodb";

const router = Router();

router.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body as Partial<UserDb>;

  try {
    const chatroom = databaseClient.db("chatroom");
    const users = chatroom.collection<UserDb>("users");
    const rooms = chatroom.collection<Room>("rooms");

    const user = await users.findOne({ username });

    if (!user || !password) {
      res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: "Invalid credentials" });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: "Invalid credentials" });
      return;
    }

    // TODO: Replace Room0 with something else
    const room = await rooms.findOne({ name: "Room0" });

    if (!room) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server Error" });
      return;
    }

    const authenticatedUser: WithId<User> = {
      _id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
    };

    res
      .status(HttpStatus.OK)
      .json({ user: authenticatedUser, roomId: room._id });
  } catch (e) {
    console.error(e);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
});

router.post("/register", async (req: Request, res: Response) => {
  const { username, password, fullName, email } = req.body as UserDb;

  try {
    const chatroom = databaseClient.db("chatroom");
    const users = chatroom.collection<UserDb>("users");
    const rooms = chatroom.collection<Room>("rooms");

    const userExists = await users.findOne({ username });

    if (userExists) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: "Bad Request" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user: UserDb = {
      username,
      fullName,
      email,
      password: hashedPassword,
    };

    const insertResult = await users.insertOne(user);

    // TODO: Replace hardcoded room
    await rooms.updateOne(
      { name: "Room0" },
      { $push: { userIds: insertResult.insertedId } }
    );

    res.status(HttpStatus.CREATED).json({ message: "User created" });
  } catch (e) {
    console.error(e);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
});

export default router;

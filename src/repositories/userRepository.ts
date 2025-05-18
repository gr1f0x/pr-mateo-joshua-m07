import User, { IUser } from "../models/User";
import { Types } from "mongoose";

export interface UserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  address: string;
}

export class UserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email });
  }

  async findById(id: string | Types.ObjectId): Promise<IUser | null> {
    return await User.findById(id);
  }

  async create(userData: UserData): Promise<IUser> {
    const newUser = new User(userData);
    return await newUser.save();
  }

  async updateTokens(
    userId: string | Types.ObjectId,
    authToken: string,
    refreshToken: string
  ): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      userId,
      { authToken, refreshToken },
      { new: true }
    );
  }

  async clearTokens(userId: string | Types.ObjectId): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      userId,
      { $unset: { authToken: "", refreshToken: "" } },
      { new: true }
    );
  }

  async checkRefreshTokenMatch(
    userId: string | Types.ObjectId,
    refreshToken: string
  ): Promise<boolean> {
    const user = await User.findById(userId);
    return user?.refreshToken === refreshToken;
  }
}

export default new UserRepository();

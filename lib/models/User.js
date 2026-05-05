import { ObjectId } from "mongodb";
import { dbConnect } from "../mongodb.js";

export const User = {
  async create(userData) {
    const db = await dbConnect();
    const result = await db.collection("users").insertOne({
      email: userData.email,
      mobile: userData.mobile || null,
      password: userData.password,
      isVerified: userData.isVerified || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return result;
  },

  async findByEmail(email) {
    const db = await dbConnect();
    return await db.collection("users").findOne({ email: email.toLowerCase() });
  },

  async findByMobile(mobile) {
    const db = await dbConnect();
    return await db.collection("users").findOne({ mobile });
  },

  async findById(id) {
    const db = await dbConnect();
    return await db.collection("users").findOne({ _id: new ObjectId(id) });
  },

  async updateVerificationStatus(email, isVerified) {
    const db = await dbConnect();
    return await db.collection("users").updateOne(
      { email: email.toLowerCase() },
      {
        $set: { isVerified, updatedAt: new Date() },
      }
    );
  },

  async updatePassword(email, hashedPassword) {
    const db = await dbConnect();
    return await db.collection("users").updateOne(
      { email: email.toLowerCase() },
      {
        $set: { password: hashedPassword, updatedAt: new Date() },
      }
    );
  },
};

export default User;

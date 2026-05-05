import { ObjectId } from "mongodb";
import { dbConnect } from "../mongodb.js";

export const OTP = {
  async create(email, otp, expiryMinutes = 10) {
    const db = await dbConnect();
    const expiryTime = new Date(Date.now() + expiryMinutes * 60000);
    
    const result = await db.collection("otps").updateOne(
      { email: email.toLowerCase() },
      {
        $set: {
          email: email.toLowerCase(),
          otp,
          expiryTime,
          createdAt: new Date(),
          isVerified: false,
        },
      },
      { upsert: true }
    );
    return result;
  },

  async findByEmail(email) {
    const db = await dbConnect();
    return await db.collection("otps").findOne({ email: email.toLowerCase() });
  },

  async verifyOTP(email, otp) {
    const db = await dbConnect();
    const record = await db.collection("otps").findOne({ 
      email: email.toLowerCase() 
    });

    if (!record) {
      return { valid: false, message: "OTP not found" };
    }

    // Check if OTP has expired
    if (new Date() > record.expiryTime) {
      return { valid: false, message: "OTP has expired" };
    }

    // Check if OTP matches
    if (record.otp !== otp) {
      return { valid: false, message: "Invalid OTP" };
    }

    // Mark OTP as verified
    await db.collection("otps").updateOne(
      { email: email.toLowerCase() },
      { $set: { isVerified: true } }
    );

    return { valid: true, message: "OTP verified successfully" };
  },

  async deleteByEmail(email) {
    const db = await dbConnect();
    return await db.collection("otps").deleteOne({ email: email.toLowerCase() });
  },

  async isEmailVerifiedViaaOTP(email) {
    const db = await dbConnect();
    const record = await db.collection("otps").findOne({ 
      email: email.toLowerCase() 
    });
    return record?.isVerified || false;
  },
};

export default OTP;

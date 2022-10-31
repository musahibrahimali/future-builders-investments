import { Document } from "mongoose";

interface IUser extends Document {
    readonly _id?: string;
    readonly username: string;
    readonly email?: string;
    readonly password?: string;
    readonly balance?: string;
    readonly referrals?: string;
    readonly deposits?: string;
    readonly withdrawals?: string;
    readonly image?: string;
    readonly salt?: string;
}

export default IUser;
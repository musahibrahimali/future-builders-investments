import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsString } from "class-validator";

export type UserModel = User & Document;

@Schema({timestamps: true })
export class User{
    @IsString()
    @Prop({ required: true, unique: false })
    username: string;

    @Prop({ required: true, })
    password: string;

    @IsString()
    @Prop({required: true, unique: true})
    email: string;

    @IsString()
    @Prop({required: false, unique: false})
    refferalCode: string;

    @IsString()
    @Prop({required: false})
    salt: string;

    // password reset key
    @IsString()
    @Prop({required: false})
    passwordResetKey: string;

    @IsString()
    @Prop({required: false, default: "0"})
    balance: string;

    @IsString()
    @Prop({required: false, default: "0"})
    referrals: string;

    @IsString()
    @Prop({required: false, default: "0"})
    deposits: string;

    @IsString()
    @Prop({required: false, default: "0"})
    withdrawals: string;

    @Prop({required: false, default: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'})
    image: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

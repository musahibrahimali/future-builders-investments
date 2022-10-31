import { Injectable } from '@nestjs/common';
import { Connection, Model } from "mongoose";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { User, UserModel } from "./schemas/user.schema";
import { JwtService } from "@nestjs/jwt";
import { CreateUserDto } from "./dto/create-user.dto";
import { IUser } from "../common/interface/interface";
import * as bcrypt from 'bcrypt';
import { ProfileInfoDto } from "./dto/profile.response.dto";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserModel>,
    private jwtService: JwtService,
    @InjectConnection() private readonly connection: Connection,
  ){}

  // register user
  async registerUser(createUserDto: CreateUserDto): Promise<string>{
    try {
      const _client = await this.createUser(createUserDto);
      if(_client._id){
        const payload = { username: _client.username, sub: _client._id };
        return this.jwtService.sign(payload);
      }
    }catch(error){
      return error;
    }
  }

  // log in user
  async loginUser(user: IUser): Promise<string>{
    try{
      const payload = { username: user.email, sub: user._id };
      return this.jwtService.sign(payload);
    }catch(error){
      return error;
    }
  }

  // update client profile
  async updateProfile(id: string, updateUserDto: CreateUserDto):Promise<ProfileInfoDto>{
    try{
      return this.updateUserProfile(id, updateUserDto);
    }catch(error){
      return error;
    }
  }

  // get user profile
  async getProfile(id: string): Promise<ProfileInfoDto>{
    try {
      const client = await this.getUserProfile(id);
      if(client === undefined) {
        return undefined;
      }
      return client;
    }catch (e) {
      return e;
    }
  }

  // update user balance
  async updateUserBalance(id: string, amount: number): Promise<boolean | any>{
    try{
      const user = await this.userModel.findOne({_id: id});
      if(!user){
        return {
          message: "User not found"
        }
      }
      // convert the user balance to number
      const balance = Number(user.balance);
      // convert the amount to number
      const _amount = Number(amount);
      // add the amount to the balance
      const newBalance = balance + _amount;
      user.balance = newBalance.toString();
      // console.log(user);
      await user.save();
      return true;
    }catch(error){
      return {
        message: error.message
      }
    }
  }

  // increase the number of deposits
  async increaseNumberOfDeposits(id: string): Promise<boolean>{
    try {
      const user = await this.userModel.findOne({_id: id});
      if(!user){
        return false;
      }
      const _number =  Number(user.deposits);
      const _newNumber = _number + 1;
      user.deposits = _newNumber.toString();
      await user.save();
      return true;
    }catch (e) {
      return false;
    }
  }

  // increase the number of refferals
  async increaseNumberOfRefferals(id: string): Promise<boolean>{
    try {
      const user = await this.userModel.findOne({_id: id});
      if(!user){
        return false;
      }
      const _number =  Number(user.referrals);
      const _newNumber = _number + 1;
      user.referrals = _newNumber.toString();
      await user.save();
      return true;
    }catch (e) {
      return false;
    }
  }

  // increase the number of withdrawals
  async increaseNumberOfWithdrawals(id: string): Promise<boolean>{
    try {
      const user = await this.userModel.findOne({_id: id});
      if(!user){
        return false;
      }
      const _number =  Number(user.withdrawals);
      const _newNumber = _number + 1;
      user.withdrawals = _newNumber.toString();
      await user.save();
      return true;
    }catch (e) {
      return false;
    }
  }


  // delete user data from database
  async deleteUserData(id:string): Promise<boolean>{
    try {
      // find and delete the client
      const _user = await this.userModel.findOneAndDelete({_id: id});
      return !!_user;
    }catch (e) {
      return false;
    }

  }

  // validate user
  async validateUser(createUserDto: CreateUserDto): Promise<IUser>{
    try {
      const user = await this.findOne( createUserDto.email, createUserDto.password);
      if(!user) {
        return undefined;
      }
      return user;
    }catch (e) {
      return e;
    }
  }

  // reset password
  async resetPassword(email: string, password?:string): Promise<boolean> {
    try {
      if (password === null) {
        const user = await this.userModel.findOne({ email: email });
        if (!user) {
          return false;
        }
        const key = await this.generateKey();
        // hash the key
        user.passwordResetKey = await this.hashPassword(key, user.salt);
        await user.save();
        // get the user email
        const _user = await this.userModel.findOne({ email: email });
        if (_user) {
          // send email with the key
          const userEmail = _user.email;
          // sent the email
          return await this.sendEmail(userEmail, key);
        }
      } else {
        // password needs to be reset
      }
    }catch (e) {
      return false;
    }
  }

  // verify reset key
  async verifyResetKey(key: string): Promise<boolean> {
    try{
      const user = await this.userModel.findOne({ passwordResetKey: key });
      return !!user;

    }catch (e) {
      return false;
    }
  }

  // sign token for social login
  async signToken(user: IUser): Promise<string> {
    try {
      const payload = { username: user.username, sub: user._id };
      return this.jwtService.sign(payload);
    }catch (e) {
      return e;
    }
  }


  /* Private methods */

  // hash the password
  private async hashPassword(password: string, salt: string): Promise<string> {
    return await bcrypt.hash(password, salt);
  }

  // generate a 6 digit random number
  private generateRandomNumber(): string {
    const randomNumber = Math.floor(Math.random() * 1000000);
    return randomNumber.toString();
  }

  // generate unique key for user password reset
  private async generateKey(): Promise<string> {
    return this.generateRandomNumber();
  }

  // send email with the key
  private async sendEmail(email: string, key: string): Promise<boolean> {
    console.log(email, key);
    return false;
  }


  // create a new client
  private async createUser(createUserDto: CreateUserDto): Promise<IUser | any> {
    try{
      // check if email already exists
      const emailExists = await this.userModel.findOne({username: createUserDto.username});
      if (emailExists){
        return {
          status: "error",
          message: "Email already exists"
        }
      }
      const saltRounds = 10;
      // generate salt
      createUserDto.salt = await bcrypt.genSalt(saltRounds);
      // hash the password
      // add the new password and salt to the dto
      createUserDto.password = await this.hashPassword(createUserDto.password, createUserDto.salt);
      const randomKey = this.generateRandomNumber();
      createUserDto.refferalCode = randomKey + createUserDto.username.slice(0, 3);
      // create a new user
      const createdClient = new this.userModel(createUserDto);
      return await createdClient.save();
    }catch(error){
      return {
        message: error.message
      }
    }
  }

  // find one client (user)
  private async findOne(email: string, password:string): Promise<ProfileInfoDto | any> {
    try{
      const user = await this.userModel.findOne({email: email});
      if(!user) {
        return undefined;
      }
      // compare passwords
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if(!isPasswordValid) {
        return null;
      }
      return {
        ...user.toObject(),
        password: "",
        salt: "",
        passwordResetKey: "",
      };
    }catch(err){
      return undefined;
    }
  }

  // get the profile of a  client (user)
  private async getUserProfile(id: string): Promise<IUser | any> {
    try{
      const user = await this.userModel.findOne({_id: id});
      if(!user) {
        return undefined;
      }
      return {
        ...user.toObject(),
        password: "",
        salt: "",
        passwordResetKey: "",
      };
    }catch(err){
      return undefined;
    }
  }

  // update profile
  private async updateUserProfile(id: string, updateUserDto: CreateUserDto): Promise<ProfileInfoDto | any>{
    // find and update the client
    const _user = await this.userModel.findOne({_id: id});
    if(_user){
      if(updateUserDto.username){
        _user.username = updateUserDto.username;
      }
      _user.save();
      return {
        ..._user.toObject(),
        password: "",
        salt: "",
      };
    }
    return {"message": "no user matching this id"};
  }

}

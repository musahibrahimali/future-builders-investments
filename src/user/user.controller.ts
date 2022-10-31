import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import { UserService } from "./user.service";
import { ConfigService } from "@nestjs/config";
import { boolean } from "joi";
import { ApiCreatedResponse } from "@nestjs/swagger";
import { CreateUserDto } from "./dto/create-user.dto";
import { JwtAuthGuard } from "../common/authorization/authorization";
import { ProfileInfoDto } from "./dto/profile.response.dto";

@Controller({version: '1', path: 'users'})
export class UserController {
  constructor(
    private userService: UserService,
    private configService: ConfigService,
  ){}

  @ApiCreatedResponse({type: String})
  @Post('register')
  async registerClient(@Body() createUserDto: CreateUserDto, @Response({passthrough: true}) response): Promise<{access_token: string}>{
    const domain = this.configService.get("DOMAIN");
    const token = await this.userService.registerUser(createUserDto);
    response.cookie('access_token', token, {
      domain: domain,
      httpOnly: true,
    });
    return {access_token : token};
  }

  @ApiCreatedResponse({type: String})
  @Post('login')
  async loginClient(@Body() createUserDto: CreateUserDto, @Response({passthrough: true}) response):Promise<{access_token: string}>{
    const client = await this.userService.validateUser(createUserDto);
    const token = await this.userService.loginUser(client);
    const domain = this.configService.get("DOMAIN");
    response.cookie('access_token', token, {
      domain: domain,
      httpOnly: true,
    });
    return {access_token : token};
  }

  // reset password
  @ApiCreatedResponse({ type: boolean })
  @Post('reset-password')
  async resetPassword(@Body() updateUserDto: CreateUserDto): Promise<boolean> {
    const password = updateUserDto.password;
    return this.userService.resetPassword(password);
  }

  // update profile
  @ApiCreatedResponse({type: ProfileInfoDto})
  @UseGuards(JwtAuthGuard)
  @Patch('update-profile/:id')
  async updateClientProfile(@Param("id") id: string, @Body() updateUserDto: CreateUserDto): Promise<ProfileInfoDto>{
    return this.userService.updateProfile(id, updateUserDto);
  }

  // get the user profile information
  @ApiCreatedResponse({type: ProfileInfoDto})
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() request):Promise<ProfileInfoDto> {
    // console.log(request.user);
    const {userId} = request.user;
    return this.userService.getProfile(userId);
  }

  // update balance
  @ApiCreatedResponse({type: boolean})
  @UseGuards(JwtAuthGuard)
  @Post('balance/:id')
  async updateBalance(@Param("id") id:string, @Body() body: { amount: number }): Promise<boolean>{
    console.log(body);
    return this.userService.updateUserBalance(id, body.amount);
  }

  // update the number of referrals
  @ApiCreatedResponse({type: boolean})
  @UseGuards(JwtAuthGuard)
  @Post('refferral/:id')
  async inCreaseRefferals(@Param("id") id: string): Promise<boolean>{
    return this.userService.increaseNumberOfRefferals(id);
  }

  // increase the number of withdrawals
  @ApiCreatedResponse({type: boolean})
  @UseGuards(JwtAuthGuard)
  @Post('withdrawals/:id')
  async increaseNumberOfWithdrawals(@Param("id") id: string): Promise<boolean>{
    return this.userService.increaseNumberOfWithdrawals(id);
  }

  // increase the number of deposits
  @ApiCreatedResponse({type: boolean})
  @UseGuards(JwtAuthGuard)
  @Post('deposits/:id')
  async increaseNumberOfDeposits(@Param("id") id: string): Promise<boolean>{
    return this.userService.increaseNumberOfDeposits(id);
  }

  // log out user
  @ApiCreatedResponse({type: null})
  @Get('logout')
  async logoutClient(@Response({passthrough: true}) response): Promise<null>{
    // console.log("were are here");
    response.cookie('access_token', '', { maxAge: 1 });
    response.redirect('/');
    return null;
  }

  // delete user account
  @ApiCreatedResponse({type: boolean})
  @UseGuards(JwtAuthGuard)
  @Delete('delete-user/:id')
  async deleteClientData(@Param("id") id: string, @Response({passthrough: true}) response): Promise<boolean>{
    response.cookie('access_token', '', { maxAge: 1 });
    return this.userService.deleteUserData(id);
  }

}

import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from "../common/constants/jwt.constants";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./schemas/user.schema";
import { JwtStrategy } from "../common/common";

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: {expiresIn: jwtConstants.expiresIn},
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [
    UserService,
    JwtStrategy,
  ],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}

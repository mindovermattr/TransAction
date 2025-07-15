import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import { User } from "../models/user/user.entity";
import { prisma } from "../prisma";

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET!,
};

const jwtStrategy = new JwtStrategy(
  jwtOptions,
  async (jwtPayload: Omit<User, "password">, done) => {
    const user = await prisma.user.findFirst({
      where: {
        id: jwtPayload.id,
      },
    });
    return done(null, user);
  }
);

export { jwtStrategy };

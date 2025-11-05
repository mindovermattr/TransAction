import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import { prisma } from "../prisma";

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET!,
};

const jwtStrategy = new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
  const user = await prisma.user.findFirst({
    where: {
      id: jwtPayload.id,
    },
  });

  if (!user) return done({ message: "Пользователя не существует" });

  const { password, ...userWithoutPassword } = user;

  return done(null, userWithoutPassword);
});

export { jwtStrategy };

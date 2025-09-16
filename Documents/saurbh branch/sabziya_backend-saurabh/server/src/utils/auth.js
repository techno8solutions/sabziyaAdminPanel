import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const publicKey = Buffer.from(process.env.PUBLIC_KEY, "base64").toString(
  "ascii"
);
// console.log("public key", publicKey);
const privateKey = Buffer.from(process.env.PRIVATE_KEY, "base64").toString(
  "ascii"
);

export function signJwt(object, options) {
  return jwt.sign(object, privateKey, {
    ...(options && options),
    algorithm: "RS256",
  });
}

export function verifyJwt(token) {
  try {
    // console.log("verifyJwt token", token);

    const decoded = jwt.verify(token, publicKey);
    return {
      valid: true,
      expired: false,
      decoded,
    };
  } catch (error) {
    return {
      valid: false,
      expired: error.message === "jwt expired",
      decoded: null,
    };
  }
}

export function jwtValid(token) {
  const result = verifyJwt(token);
  return result.valid || result.expired;
}

import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.join(process.cwd(), ".env"),
});

const config = {
  port: process.env.PORT,
  connection: process.env.CONNECTION_STRING,
  secret: process.env.JWT_SECRET,
  expTime: process.env.JWT_EXPIRESINTIME,
  refresh_secrete: process.env.JWT_REFRESH_SECRET
};

export default config;

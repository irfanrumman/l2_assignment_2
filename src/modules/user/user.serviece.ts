import config from "../../configaration";
import { pool } from "../../db";
import AppError from "../../utils/appError";
import type { ILogUser, IUser } from "./user.interface";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const signupUserToDB = async (payload: IUser) => {
  const { name, email, password, role } = payload;

  const hashPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `
     INSERT INTO users(name, email, password, role) VALUES($1, $2, $3, COALESCE($4, 'contributor')) RETURNING *
    `,
    [name, email, hashPassword, role],
  );

  if (result.rows.length === 0) {
    throw new AppError(404,"User not created");
  }

  delete result.rows[0].password;
  return result.rows[0];
};

const loginUserFromDB = async (payload: ILogUser) => {
  const { email, password } = payload;

  const userData = await pool.query(
    `
    SELECT * FROM users WHERE email=$1
    `,
    [email],
  );

  if (userData.rows.length === 0) {
    throw new AppError(400,"Wrong Email!");
  }

  const logUser = userData.rows[0];
  const matchPassword = await bcrypt.compare(password, logUser.password);

  if (!matchPassword) {
    throw new AppError(400,"Wrong Password");
  }

  // Generate jwt_token

  const jwtPayload = {
    id: logUser.id,
    name: logUser.name,
    email: logUser.email,
    role: logUser.role,
  };

  const token = jwt.sign(jwtPayload, config.secret as string, {
    expiresIn: "1d",
  });


  const user = {
    ...jwtPayload,
    created_at: logUser.created_at,
    updated_at: logUser.updated_at,
  };

  return { token, user };
};

export const authService = {
  signupUserToDB,
  loginUserFromDB,
};

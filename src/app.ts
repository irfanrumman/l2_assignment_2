import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { authRoute } from "./modules/user/user.route";

const app: Application = express();

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Assignment_2",
    author: "Irfan",
  });
});

app.use("/api/auth", authRoute);

export default app;

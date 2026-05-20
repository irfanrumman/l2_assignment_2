import express, {
  type Application,
  type Request,
  type Response,
} from "express";

const app: Application = express();

app.use(express.json);
app.use(express.text);
app.use(express.urlencoded);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Assignment_2",
    author: "Irfan",
  });
});

export default app;

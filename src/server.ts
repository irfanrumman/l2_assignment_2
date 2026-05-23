import app from "./app";
import config from "./configaration";
import { initDB } from "./db";

const main = () => {
  try {
    initDB();
    app.listen(config.port, () => {
    console.log(`server is running! on port ${config.port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

main();

import app from "./app";
import config from "./configaration";

const main = () => {
  app.listen(config, () => {
    console.log("server is running!");
  });
};

main();

import app from "./app.js";
import config from "./config/index.js";
import logger from "./config/logger.js";

const PORT = config.port || 3000;

app.listen(PORT, () => {
  logger.info(
    `🚀 Server running at http://localhost:${PORT} in ${config.env} mode`
  );
});

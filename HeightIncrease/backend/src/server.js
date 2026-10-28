const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const connectDb = require("./config/db");
const env = require("./config/env");
const apiRoutes = require("./routes");
const { openApiDocument, swaggerHtml } = require("./swagger");
const { notFound, errorHandler } = require("./middleware/error");

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false
  })
);
app.use(
  cors({
    origin(origin, callback) {
      if (env.corsOrigin === "*" || !origin) {
        return callback(null, true);
      }

      const allowed = env.corsOrigin.split(",").map((item) => item.trim());
      return callback(null, allowed.includes(origin));
    },
    credentials: true
  })
);
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.get("/api-docs.json", (req, res) => res.json(openApiDocument));
app.get("/api-docs", (req, res) => res.type("html").send(swaggerHtml("Height Increase API Docs", "/api-docs.json")));
app.use("/api", apiRoutes);

const adminDir = path.join(__dirname, "..", "public", "admin");
app.use("/admin", express.static(adminDir));
app.get("/", (req, res) => res.redirect("/admin"));
app.get("/admin/*", (req, res) => res.sendFile(path.join(adminDir, "index.html")));

app.use(notFound);
app.use(errorHandler);

async function start() {
  await connectDb();
  app.listen(env.port, () => {
    console.log(`Server running on http://localhost:${env.port}`);
    console.log(`Admin panel: http://localhost:${env.port}/admin`);
    console.log(`API docs: http://localhost:${env.port}/api-docs`);
  });
}

if (require.main === module) {
  start().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = app;

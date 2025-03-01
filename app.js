import express from "express";
import cors from "cors";

import ordersRoutes from "./routes/orders-routes.js";
import foodItemsRoutes from "./routes/foodItems-routes.js";
import usersRoutes from "./routes/users-routes.js";
import categoriesRoutes from "./routes/categories-routes.js";
import fileRoutes from "./routes/file-upload-routes.js";
import addressesRoutes from "./routes/addresses-routes.js";
import HttpError from "./models/http-error.js";
import connectDB from "./db/index.js";

const app = express();

app.use(express.json());

const allowedDomains = [
  "http://localhost:3000",
  "https://peddadameals.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedDomains.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
    ],
  })
);

app.use("/api/orders", ordersRoutes);
app.use("/api/fooditems", foodItemsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/upload", fileRoutes);
app.use("/api/addresses", addressesRoutes);

app.use((req, res, next) => {
  throw new HttpError("Could not find this route!", 404);
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }

  res
    .status(error.code || 500)
    .json({ message: error.message || "An unknown error occured!" });
});

const PORT = process.env.PORT || 8000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on Port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("Mongodb connection error ", error);
  });

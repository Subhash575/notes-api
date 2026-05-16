import "dotenv/config";
import express from "express";

const app = express();

// Middleware
app.use(express.json()); // parse incoming JSON bodies

// Routes
import authRoutes from "./routes/auth";
import notesRoutes from "./routes/note";
import metaRoutes from "./routes/meta.js";
import searchRoutes from "./routes/search.js";

app.use("/", authRoutes);
app.use("/", metaRoutes);
app.use("/notes", notesRoutes);
app.use("/search", searchRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal server error" });
  },
);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

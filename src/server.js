import express from "express";
import { ENV } from "./config/env.js";
import { db } from "./config/db.js";
import { favoritesTable } from "./db/schema.js";
import { eq } from "drizzle-orm";

const app = express();

const PORT = ENV.PORT || 8001;

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json(ENV.NODE_ENV);
});

// add recipe
app.post("/api/favorites", async (req, res) => {
  try {
    const { userId, recipeId, title, image, cookTime, serving } = req.body;

    if (!userId || !recipeId || !title) {
      return res.status(400).json({ error: "missing required fields" });
    }

    const favorite = await db
      .insert(favoritesTable)
      .values({
        userId,
        recipeId,
        title,
        image,
        cookTime,
        serving,
      })
      .returning();

    res.status(201).json(favorite[0]);
  } catch (e) {
    console.log("error adding favorite", e);

    res.status(500).json({ error: "something happend " });
  }
});

app.get("/api/favorites/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const favorites = await db
      .select()
      .from(favoritesTable)
      .where(eq(favoritesTable.userId, userId));

    res.status(200).json(favorites);
  } catch (e) {
    console.log(e);
  }
});

app.delete("/api/favorites/:recipeId", async (req, res) => {
  try {
    const { recipeId } = req.params;

    await db
      .delete(favoritesTable)
      .where(eq(favoritesTable.recipeId, parseInt(recipeId)));

    res.status(200).json({ message: "recipe removed from favorites list" });
  } catch (e) {
    console.log(e);
  }
});

app.listen(PORT, () => {
  console.log(`Server is listing on ${PORT}`);
});

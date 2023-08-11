import express from "express";
import { PrismaClient } from "@prisma/client";

const port = 3000;
const app = express();
const prisma = new PrismaClient();

app.get("/movies", async (_, res) => {
    // res.send("Listagem de filmes");
    const movies = await prisma.movie.findMany({
        orderBy: {
            title: "asc"
        },
        include: {
            languages: true,
            genders: true
        }
    });
    res.json(movies);
});

app.get("/", (_, res) => {
    res.send("Hello");
});

app.listen(3000, () => {
    console.log(`Server listening on port ${port}`);
});
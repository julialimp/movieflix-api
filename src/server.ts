import express from "express";
import { PrismaClient } from "@prisma/client";

const port = 3000;
const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.get("/movies", async (_, res) => {
    const movies = await prisma.movie.findMany({
        orderBy: {
            title: "asc"
        },
        include: {
            languages: true,
            genders: true,
        },
    });
    res.json(movies);
});

app.post("/movies", async (req, res) => {
    // console.log(`Conteúdo do body enviado na requisição ${req.body}`);
    const { title, gender_id, language_id, oscar_count, release_date } = req.body;

    // await prisma.movie.create({
    //     data: {
    //         title: "Filme teste",
    //         gender_id: 7,
    //         language_id: 1,
    //         oscar_count: 0,
    //         //mês começa em 0 e vai até 11
    //         release_date: new Date(2022, 0, 1)
    //     },
    // });
    try {
        //verificar no banco se já tem filme com o mesmo nome
        const movieWithSameName = await prisma.movie.findFirst({
            where: {
                title: {
                    equals: title,
                    mode: "insensitive"
                }
            },
        });

        if (movieWithSameName) {
            return res.status(409).send({ message: "It already exists a movie with that title" });
        }

        await prisma.movie.create({
            data: {
                //como os nomes da propriedade e do valor são exatamente iguais, poderia omitir um deles para ficar menos código.
                title,
                gender_id,
                language_id: language_id,
                oscar_count: oscar_count,
                release_date: new Date(release_date)
            }
        });
    } catch (error) {
        return res.status(500).send({ message: "falha ao cadastrar um filme" });
    }

    res.status(201).send();
});

app.listen(3000, () => {
    console.log(`Server listening on port ${port}`);
});
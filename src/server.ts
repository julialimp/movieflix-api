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

app.put("/movies/:id", async (req, res) => {
    //pegar id do registro
    // console.log(req.params.id);
    try {
        const id = Number(req.params.id); //aqui ele está convertendo string em number.

        const movie = await prisma.movie.findUnique({
            where: { id }
        });
        if (!movie) {
            return res.status(404).send({ message: "Movie not found" });
        }

        const data = { ...req.body };
        data.release_date = data.release_date ? new Date(data.release_date) : undefined;

        //pegar dados do filme que será atualizado
        await prisma.movie.update({
            where: {
                id
            },
            data
        });
    } catch (error) {
        return res.status(500).send({ message: "Failed to update register" });
    }
    //retornar status informando que filme foi atualizado
    res.status(200).send();

});

app.delete("/movies/:id", async (req, res) => {
    const id = Number(req.params.id);
    try {
        const movie = await prisma.movie.findUnique({
            where: { id },
        });
        if (!movie) {
            return res.status(404).send({ message: "Movie not found" });
        }

        await prisma.movie.delete({
            where: { id },
        });
    } catch (error) {
        return res.status(500).send({ message: "Failed to delete register" });
    }

    res.status(200).send();
});

app.get("/movies/:genderName", async (req, res) => {
    // console.log(req.params.genderName);
    const genderName = req.params.genderName;
    try {
        //filtrar filmes do banco pelo gênero
        const moviesFilteredByGenderName = await prisma.movie.findMany({
            include: {
                genders: true,
                languages: true,
            },
            where: {
                genders: {
                    name: {
                        equals: genderName,
                        mode: "insensitive",
                    }
                }
            }
        });
        res.status(200).send(moviesFilteredByGenderName);
    } catch (error) {
        return res.status(500).send({ message: "Failed do update movie" });
    }
    //retornar filmes filtrados


});

app.listen(3000, () => {
    console.log(`Server listening on port ${port}`);
});
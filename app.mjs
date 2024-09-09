import 'dotenv/config'

const port = process.env.PORT;

import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import morgan from 'morgan';
import cors from 'cors';

import documents from "./docs.mjs";

const app = express();

app.disable('x-powered-by');
app.set("view engine", "ejs");
app.use(express.static(path.join(process.cwd(), "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// don't show the log when it is test
if (process.env.NODE_ENV !== 'test') {
    // use morgan to log at command line
    app.use(morgan('combined')); // 'combined' outputs the Apache style LOGs
}


app.get('/', async (req, res) => {
    return res.render("index", { docs: await documents.getAll() });
});


app.post("/", async (req, res) => {
    const result = await documents.addOne();

    return res.redirect(`/${result.lastID}`);
});


app.get('/:id', async (req, res) => {
    return res.render(
        "doc",
        { doc: await documents.getOne(req.params.id) }
    );
});


app.put('/:id', async (req, res) => {
    try {
        const result = await documents.updateOne(req.params.id, req.body);
        console.log(result);
        if (result.modifiedCount > 0) {
            return res.redirect(`/dgfhhfg`);
        } else {
            return res.status(404).send("Document not found or not updated.");
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send("An error occurred during the update.");
    }
});



app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});

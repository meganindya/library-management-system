import express, { Application, Request, Response, NextFunction } from "express";

const app: Application = express();

app.get("/", (req: Request, res: Response, next: NextFunction) => {
    res.send("Hello World!");
});

app.listen(process.env.PORT || 8000, () =>
    console.log(`server listening on port ${process.env.PORT || 8000}`)
);

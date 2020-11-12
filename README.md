# Cloud based Library Management Service (IT752 Internet and Web Technology Lab Project)

## Project Statement

There are two types of users: **student** and **faculty**. They can browse books available. For students the maximum duration to hold a title is 30 days and for faculty it is 180 days. 5 and 8 are the upper limits of holding number of books for student and faculty respectively. Same title cannot be issued to a user. Holding a title more than the speculated duration will be charged ₹ 1/- per day. A mail will be sent as a warning two days before the due date of each title held.

## Tech Stack

### So far (project in progress)

The project is built using the _MERN_ stack. `TypeScript` instead of conventional `JavaScript` is used throught.

#### Front end

- React JS
- SASS

#### Back end

- Node JS
- Express
- GraphQL (Node JS)
- Mongo DB (Atlas - AWS)
- Mongoose

### Further intended

- RabbitMQ
- PostgreSQL (GCP)

## How to Run

### Setup Database

- Create a MongoDB Atlas account and then create a cluster.
- Open collections in the cluster and visit the `Command Line Tools` tab.
- Scroll down to `Data Import and Export Tools` section and copy the import string. It should look like `mongoimport --uri mongodb+srv://<USERNAME>:<PASSWORD>@cluster0.snhzr.mongodb.net/<DATABASE> --collection <COLLECTION> --type <FILETYPE> --file <FILENAME>`
- Install MongoDB Tools and then open terminal.
- Follow for all 4 files in [dummy database content](./data/json/): paste the string from above while filling the data in the `<...>` parts — for `DATABASE` use `library`, for `COLLECTION` use `authors`, `books`, `users`, `transactions` one at a time, for `FILETYPE` use `json`, and finally for `FILENAME` provide path to each file relative to the terminal's PWD.

### Steps

- Install Node JS
- Clone Repository
- Navigate to each of `frontend` and `backend` directories and run (in terminal) `npm ci`
- Thereafter, in `frontend` directory and run `npm start`
- Thereafter, in `backend` directory and run `npm run dev`
- Launch web app from `localhost:3000`
- (optional) Launch GraphiQL app from `localhost:8000/api`

**Note:** `Project doesn't adapt to varying screen sizes; designed and tested on a monitor having resolution 2560 x 1080 with 100% display scaling, checked to appear fine on 1920 x 1080 at 125% scaling. For other configurations, front-end design may look out of place.`

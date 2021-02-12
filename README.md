# Cloud based Library Management Service (IT752 Internet and Web Technology Lab Project)

## Project Statement

There are two types of users: **student** and **faculty**. They can browse books available. For students the maximum duration to hold a title is 30 days and for faculty it is 180 days. 5 and 8 are the upper limits of holding number of books for student and faculty respectively. Same title cannot be issued to a user. Holding a title more than the speculated duration will be charged ₹ 1/- per day. A mail will be sent as a warning two days before the due date of each title held.

## Demo

View [demo discussion](https://github.com/meganindya/library-management-system/discussions/7).

## Tech Stack

### So far (project in progress)

The project is built using the _MERN_ stack plus `PostgreSQL` and `GraphQL`. `TypeScript` instead of conventional `JavaScript` is used throught.

#### Front end

- React JS
- SASS

#### Back end

- Node JS
- Express
- GraphQL (Node JS)
- Mongo DB (Atlas - AWS)
- Mongoose
- PostgreSQL (AWS)
- AMQP (RabbitMQ)

## How to Run

### Setup Databases

#### MongoDB

- Create a **MongoDB Atlas** account and create a cluster.
- Open collections in the cluster and visit the `Command Line Tools` tab.
- Scroll down to `Data Import and Export Tools` section and copy the import string. It should look like `mongoimport --uri mongodb+srv://<USERNAME>:<PASSWORD>@cluster0.snhzr.mongodb.net/<DATABASE> --collection <COLLECTION> --type <FILETYPE> --file <FILENAME>`
- Install **MongoDB Tools** and then open terminal.
- Follow for all 3 files in [dummy database content](./data/MongoDB/json/): paste the string from above while filling the data in the `<...>` parts — for `DATABASE` use `library`, for `COLLECTION` use `authors`, `books`, `users`, one at a time, for `FILETYPE` use `json`, and finally for `FILENAME` provide path to each file relative to the terminal's PWD.

#### PostgreSQL

- Create an **ElephantSQL** account and create an instance.
- Install **PostgreSQL** (installs **pgAdmin**).
- Launch `pgAdmin` -> Right Click on `Servers` (left panel) -> `Create Server`.
- Fill in details (name, host, database, username, password) which you'll get once you create the ElephantSQL instance.
- After Server is added, expand it (left panel) -> expand `Databases` then scroll down to find your database and expand it -> expand `Schemas` -> expand `Public`.
- Right click on `Tables` -> `Create Table` for each table according to the schema:
    `Joins are not being used here so it doesn't matter whether you use PRIMARY KEYs (PKs), but it serves as a constraint`
  - "shelf" ("bookID" VARCHAR(16) PK, "quantity" numeric)
  - "notifications" ("userID" VARCHAR(16) PK, "bookID" VARCHAR(16) PK)
  - "awaiting" ("userID" VARCHAR(16) PK, "bookID" VARCHAR(16) PK, "type" VARCHAR(8), "createdAt" TIMESTAMP without Timezone)
  - "transactions" ("transID" VARCHAR(16) PK, "userID" VARCHAR(16), "bookID" VARCHAR(16), "borrowDate" TIMESTAMP without Timezone, "returnDate" TIMESTAMP without Timezone - can be NULL)
- For each table, Right click on table name after expanding `Tables` -> visit `Tools` (menu bar) -> click `Import/Export` -> Select [file path](./data/PostgreSQL/) followed by filename for each `.csv` file corresponding to each of the 4 tables, and import the dummy data.

### Steps

- Install Node JS
- Clone Repository
- Setup Databases
- Install RabbitMQ
- Navigate to each of `frontend` and `backend` directories and run (in terminal) `npm ci`
- In `frontend` directory, run `npm start`
- In `backend` directory, edit the contents of `.env` file with your databases configuration information
- Start RabbitMQ service
- In `backend` directory, run `npm run dev`
- Launch web app from `localhost:3000`
- (optional) Launch GraphiQL app from `localhost:8000/api`

**Note:** `Project doesn't adapt to varying screen sizes; designed and tested on a monitor having resolution 2560 × 1080 with 100% display scaling, checked to appear fine on 1920 × 1080 at 125% scaling. For other configurations, front-end design may look out of place.`

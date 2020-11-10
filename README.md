# Cloud based Library Management Service (IT752 Internet and Web Technology Lab Project)

## Project Statement

There are two types of users: **student** and **faculty**. They can browse books available. For
students the maximum duration to hold a title is 30 days and for faculty it is 180 days. 5 and 8 are
the upper limits of holding number of books for student and faculty, respectively. Same title cannot
be issued to a user. Holding a title more than the speculated duration will be charged ₹ 1/- per
day. A mail will be sent as a warning two days before the due date of each title held.

## How to Run

- Install Node JS
- Clone Repository
- Navigate to each of `frontend` and `backend` directories and run (in terminal): `npm ci`
- Thereafter, in `frontend` directory and run: `npm start`
- Thereafter, in `backend` directory and run: `npm run dev`

**Note:** `Project doesn't adapt to varying screen sizes; designed and tested on a monitor having resolution 2560 x 1080 with 100% display scaling, checked to appear fine on 1920 x 1080 at 125% scaling. For other configurations, front-end design may look out of place.`

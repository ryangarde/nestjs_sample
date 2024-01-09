# Introduction

TODO: Give a short introduction of your project. Let this section explain the objectives or the motivation behind this project.

# Getting Started

To create a new migration run:
npm versions 6 and below: `npm run migrate:create --name <table-name>`
npm 7+: `npm run migrate:create -- --name <table-name>`

This will create a migration file where you can specify the table structure. When you are done, yun `npm run migrate:generate` this will generate a migration file inside the `drizzle` folder (just look at the latest file generated). You can check the migration file and make sure it is correct. Then run `npm run migrate` to generate the table in the database.

If you want to populate the db with some data, you can run `npm run seed:create` to create a seed file. Then you can populate the seed file with data. When you are done, run `npm run seed` to populate the database with the data.

Summary:

1. `npm run migrate:create -- --name <table-name>`
   2: `npm run migrate:generate`
2. `npm run migrate`
   Proceed to step 4 if you want to populate the db with data
3. `npm run seed:create`
4. `npm run seed`

When you made a mistake by generating a wrong migration file, do not delete the migration file inside drizzle. Instead, run `npm run migrate:drop` then in the terminal it will let you choose the migration file to drop.

# Build and Test

TODO: Describe and show how to build your code and run the tests.

# Contribute

TODO: Explain how other users and developers can contribute to make your code better.

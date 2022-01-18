Beginning of Project 9!

IMMEDIATE TASK (<= 3 steps in here...>)
1)  Look up the authenticate() and sync() calls in project 8
2)  Put one into app.js here
3)  Create a scripts/authenticate.js file and require it into app.js


Learning points to set up and configure:
Sequelize:
https://teamtreehouse.com/library/using-sql-orms-with-nodejs/getting-started-with-sequelize/install-and-configure-sequelize-and-sqlite
... this is from the "Using SQL ORM's with Node.js" course, part 2 (Install and configure Sequelize and SQLite), from Unit 8. This covers the development of a project from scratch.

Need to go back further, though.
 - what files were downloaded with Unit 8?
 - what steps do I go through to create the models?
 - what does .authenticate() do, especially regarding synching?
 - Oh, and https://sequelize.org/master/manual/migrations.html is a great resource here: a complete list of stuff including setting up the models.

 - Project8: there's a library.db file that opens in DBBrowser. I think the "Models" are a wee construction that Sequelize uses.

QUESTIONS
 - How do you actually CREATE A DATABASE?
 - What is the difference between sqlite and sequelize? Can you create a db using sequelize-cli? Does the model you create in sequelize have to already exist?
  - For clues - what is downloaded with Unit 8 and Unit 9?
  - For cluse - what do the Unit 8 tutorial projects begin with?
  - Having created an empty db, what's the impact of .sync()?

ANSWERS SO FAR...
 - a blank database with no models or metadata can be created in the command line.
 - then, you can set up models entirely within the app, and sync() creates if not exists
 - though, obviously, they don't have data in them at that point.


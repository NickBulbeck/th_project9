 - Look up how the asyncHandler is supposed to deal with errors
 - Go through each route and consider the possible validation errors
 - If they're all either constraint or validate, add that to the array of errors
 - 






DONE - set up the asyncHandler file and function
DONE - require it in to apiRoutes.js
DONE - require in sequelize and stuff to apiRoutes.js
DONE - put in one-line comments for each of the routes I need in apiRoutes.js
DONE - add in app.use(express.json()) - express middleware instead of bodyparser.
DONE - the above tells us to expect request body's to be json
DONE - make sure I've got app.use('/api',apiRoutes)
- look up CORS and whether to do anything with it
DONE - create an authorising middleware using https://teamtreehouse.com/library/set-up-the-authentication-middleware
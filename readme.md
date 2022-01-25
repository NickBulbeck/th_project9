Beginning of Project 9!

IMMEDIATE TASK (<= 3 steps in here...>)
1)  Re-discover what "currently authenticated User" means.
2)  Check out the users/get routes in the unit 9 coursework.
3)  Check out the users/post routes likewise.

LEARNING NOTES
 - There must be a difference between unauthorised and logged-in requests
 - We GET all users using /users, but we GET the current user using /users/n
 - We POST to /courses or /users, not to /courses/1 or /users/2
 - We PUT to /courses/1 or /users/2
 - We could DELETE /users in principle, but in practice we'll only DELETE /users/n
 - /url/endpoing.json?key=value is a url + query (or query string)
 - HTTP has a defined set of keys for request headers which contain key/value pairs
 - Sam wants to upgrade to a new version of /facebook/api/v, btw.
 - Requests and responses both have headers.
 - There are hunners of status codes, which have standardised meanings.
 - Cacheing isn't really part of Unit 9, but there are standard cacheing tools.
 - Rate-limiting likewise.
 - res.json() converts an **object** to json.
 - for PUT requests, it's customary to send a 204 status and nothing else
 - for DELETE requests, use res.status(204).end();
 - create an object with "errors" : ["error","error"] and res.json({errors}) it
 - consider returning user and developer versions of each error
 - consider the built-in express-validator library


ANSWERS SO FAR...
 - a blank database with no models or metadata can be created in the command line.
 - then, you can set up models entirely within the app, and sync() creates if not exists
 - though, obviously, they don't have data in them at that point.


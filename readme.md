Greetings from Scotland!

Welcome to this exciting TreeHouse Fullstack JavaScript Tech Degree Unit 9 Project. I hope
you have at least 30% as much fun reviewing it as I did writing it; though even 20% would
still be a significant quantity of fun.

NOTES ON TESTING THE PROJECT
I've installed newman, the POSTMAN cli tool, as a dev-dependency. This means that you can
run the test file RESTAPI.postman_collection.json by entering "npm test" (I've add a "test"
script to package.json for this). The complication is that this only works when the server
is running, obviously, so you'll need to start the server in one terminal tab and then
run npm test in another.

I've added automated tests to the RESTAPI...etc.json files (apart from
RESTAPI-NO_TESTS.postman_collection.json which is the original file from the project 
"starter kit"). These run within Postman along with the requests, and also with the 
"npm test" command as mentioned above. They should all pass..!

I've also added a bit of functionality, especially in the shape of a "role" attribute for the
user model. This can be either "standard" or "admin", with admin users able to access a
number of extra functions:
 - Viewing all the courses together
 - Viewing, editing and deleting courses they don't own
 - Deleting users
 - Editing user records other than their own
 - Assigning courses between users
 To support this, I've included an enhanced authenticateUser.js file, which takes a boolean
 argument to indicate whether it needs to authenticate only admin users. This argument 
 defaults to "false", with which it will authenticate both admin and standard users. When it is set to
 "true", authenticateUser will reject any non-admin users with the error "insufficient privileges"
 and a 403 status.

 To support this added functionallity, I've beefed up the seed files (to add myself as an admin
 user - bit of ego there, clearly) and one or two other courses. The file
 RESTAPI-NICK_TESTS.postman_collection.json includes tests for this additional functionality.

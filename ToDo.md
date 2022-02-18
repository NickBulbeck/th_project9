Potential refactors:
1) Split the user and course routes up into seperate files
2) See if I can get the validations for PUT '/courses/:id' into a file like authenticateUser
3) Investigate the RESTAPI.postman_collection.json file and beef it up with more test cases
4) Investigate nodemon.json and see how to edit/play around with it - e.g. move it into the "start" script
5) Tidy up the readme.md file

Friday:
1) Find docs on pm.response: what does pm.response.json() do, and what input does it use?
2) That is, why does the global error handler not add anything to pm.response.json() when there's a response body visible in Postman?

Saturday:
1) Do the following tests:
 - users GET user/:id                   DONE
 - users GET all                        DONE 
 - users PUT user/:id                   DONE
 - users DELETE user/:id                DONE
 - courses PUT non-owner with auth      DONE
 - courses DELETE non-owner with auth   DONE
 2) Complete the GET users/id route     todo
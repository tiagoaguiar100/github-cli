# github-cli

Command-line interface for GitHub is a simple tool to get user information from Github through its API, then the tool will save the information in a local database.

It also offers some commands for querying the database to retrieve alls it data or based on location or programming language of the user's repo.

Getting started:
1. ``` npm i ``` - It will install all the dependencies needed
2. Fill the ``` .env.local ``` file with credentials for the database and github api token
3. ``` npm start ``` - It will run this CLI and will have prompts to query the api and database

Additional scripts:  
- ``` npm run lint ``` - It will run eslint with fix flag to enforce good practices
- ``` npm run deploy ``` - It will install this tool globally
- ``` npm run dev ``` - It will build and run the application
- ``` npm test ``` - It will run all unit tests

Requirements:
 - PostgreSQL v16.4
 - Node.js
 - Typescript

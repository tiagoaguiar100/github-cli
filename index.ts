#!/usr/bin/env node
import chalk from 'chalk';
import {fetchUser} from './fetchUser';
import { initDB } from './repository/database';
import { 
  getUsers, 
  getUsersBy,
} from './repository/user';
import { input, select } from '@inquirer/prompts';

async function main() {

  const db = initDB();

  console.log(
    chalk.green("GitHub CLI")
  );

  select({
    message: 'Select a command',
    choices: [
      {
        name: 'fetch-user',
        value: 'fetch-user',
        description: 'fetch the user data from GitHub API',
      },
      {
        name: 'get-users',
        value: 'get-users',
        description: 'display all users from database',
      },
      {
        name: 'get-users-by',
        value: 'get-users-by',
        description: 'display users from database with' +
        ' a specific location and/or programming language',
      },
    ],
  }).then(async (answer) => {
    switch (answer) {
    case 'fetch-user':
      input({ message: 'Enter a username' }).then(
        username => fetchUser(db, username)
      );
      break;
    case 'get-users':
      getUsers(db);
      break;
    case 'get-users-by': {
      const location = await input({ message: '(Optional) Enter a location' });
      const language = await input({ message: '(Optional) Enter a language' });
      getUsersBy(db, location, language);
      break;
    }
    default:
      break;
    }
  });
}

main();
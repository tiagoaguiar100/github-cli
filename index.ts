#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import {fetchUser} from './fetchUser';
import { initDB } from './repository/database';
import { getUsers, getUsersByLanguage, getUsersByLocation } from './repository/user';

const db = initDB(); 

yargs(hideBin(process.argv))
  .command('fetch-user <username>', 'fetch the user data from GitHub API', () => {}, async (argv) => {
    fetchUser(db, argv.username);
  })
  .command('get-users', 'display all users from database', () => {}, (argv) => {
    getUsers(db);
  })
  .command('get-users-by-location <location>', 'display users from database with a specific location', () => {}, (argv) => {
    getUsersByLocation(db, argv.location as string);
  })
  .command('get-users-by-language <language>', 'display users from database with a repositories on that language', () => {}, (argv) => {
    getUsersByLanguage(db, argv.location as string);
  })
  .demandCommand(1)
  .parse()

#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import {fetchUser} from './fetchUser';

yargs(hideBin(process.argv))
  .command('fetch-user <username>', 'fetch the user data from GitHub API', () => {}, async (argv) => {
    fetchUser(argv.username);
  })
  .command('get-users', 'display all users from database', () => {}, (argv) => {
    console.info(argv)
  })
  .command('get-users-by-location <location>', 'display users from database with a specific location', () => {}, (argv) => {
    console.info(argv)
  })
  .command('get-users-by-language <language>', 'display users from database with a repositories on that language', () => {}, (argv) => {
    console.info(argv)
  })
  .demandCommand(1)
  .parse()
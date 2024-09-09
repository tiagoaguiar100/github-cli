import pgPromise from 'pg-promise';
import { run_sql } from '../sql/util';

/**
 * Initialize DB with 
 * @returns database
 */
export const initDB = () => {
    
  const cn = 'postgres://' +
    `${process.env["DB_USER"]}:` +
    `${process.env["DB_PASSWORD"]}@` +
    `${process.env["DB_HOST"]}:` +
    `${process.env["DB_PORT"]}/` +
    'github-cli-db';
  
  const pgp = pgPromise({/* Initialization Options */});
  db = pgp(cn);

  db.none(run_sql('create.sql'));
}

let db: any;

export const getDBConnection = () => db
import pgPromise from 'pg-promise';

export const initDB = () => {
    
  const cn = `postgres://
    ${process.env["DB_USER"]}:
    ${process.env["DB_PASSWORD"]}@
    ${process.env["DB_HOST"]}:
    ${process.env["DB_PORT"]}/
    github-cli-db`;
  
  const pgp = pgPromise({/* Initialization Options */});
  return pgp(cn);
}


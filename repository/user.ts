
import { errors, ParameterizedQuery as PQ } from 'pg-promise';
import { getDBConnection } from './database';

export interface User {
    id: string,
    name: string,
    location: string,
    languages?: string[]
}

const NO_RESULTS_MESSAGE = "No results.";

export function getUser(
  username: string, 
  ignoreNoData?: boolean): 
  Promise<User> {
  const findUser = new PQ({
    text: 'SELECT * FROM public."User" WHERE id = $1', 
    values: [username]
  });

  return getDBConnection().one(findUser)
    .then((user: User) => {
      return user;
    })
    .catch((error: errors.QueryResultError) => {
      if(error.code === errors.queryResultErrorCode.noData && ignoreNoData) {
        return null;
      }

      if(error.code === errors.queryResultErrorCode.noData) {
        console.log(NO_RESULTS_MESSAGE);
        return null;
      } else {
        console.log(error.message);
        return null;
      }
    });
}

export function getUsers(): Promise<User[]> {
  const findUsers = new PQ({
    text: 'SELECT * FROM public."User"'
  });

  return getDBConnection().many(findUsers)
    .then((users: User[]) => {
      return users;
    })
    .catch((error: errors.QueryResultError) => {
      if(error.code === errors.queryResultErrorCode.noData) {
        console.log(NO_RESULTS_MESSAGE);
        return null;
      } else {
        console.log(error.message);
        return null;
      }
    });
}

export function getUsersBy(
  location: string, 
  language: string): 
  Promise<User[]> {
  let whereClause;
  let values;

  if(location && language) {
    whereClause = "LOWER(location)=LOWER($1) AND " +
    "LOWER($2)=ANY(LOWER(languages::text)::text[])";
    values = [location, language];
  }
  else if(location) {
    whereClause =  "LOWER(location)=LOWER($1)";
    values = [location];
  }
  else if(language) {
    whereClause =  "LOWER($1)=ANY(LOWER(languages::text)::text[]) "; 
    values = [language];
  }
  else {
    return getUsers();
  }

  const findUsers = new PQ({
    text: `SELECT * FROM public."User" WHERE ${whereClause}`, 
    values: values
  });
  
  return getDBConnection().many(findUsers)
    .then((users: User[]) => {
      return users;
    })
    .catch((error: errors.QueryResultError) => {
      if(error.code === errors.queryResultErrorCode.noData) {
        console.log(NO_RESULTS_MESSAGE);
        return null;
      } else {
        console.log(error.message);
        return null;
      }
    });
}

export async function insertUser(user: User) {
  await getDBConnection().
    query('INSERT INTO public."User"(${this:name}) VALUES(${this:csv})', 
      user
    );
}
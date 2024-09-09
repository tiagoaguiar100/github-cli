
import { errors, ParameterizedQuery as PQ } from 'pg-promise';
import { getDBConnection } from './database';

export interface User {
    id: string,
    name: string,
    location: string,
    languages?: string[]
}

export function getUser(username: string, ignoreNoData?: boolean): User {
  const findUser = new PQ({
    text: 'SELECT * FROM public."User" WHERE id = $1', 
    values: [username]
  });

  return getDBConnection().one(findUser)
    .then((user: any) => {
      console.log(user);
      return user;
    })
    .catch((error: errors.QueryResultError) => {
      if(error.code === errors.queryResultErrorCode.noData && ignoreNoData) {
        return;
      }

      if(error.code === errors.queryResultErrorCode.noData) {
        console.log("No results.");
      } else {
        console.log(error);
      }
    });
}

export function getUsers(): User[] {
  const findUsers = new PQ({
    text: 'SELECT * FROM public."User"'
  });

  return getDBConnection().many(findUsers)
    .then((users: any) => {
      console.log(users);
      return users;
    })
    .catch((error: errors.QueryResultError) => {
      if(error.code === errors.queryResultErrorCode.noData) {
        console.log("No results");
      } else {
        console.log(error);
      }
    });
}

export function getUsersBy(location: string, language: string): User[] {
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
      console.log(users);
      return users;
    })
    .catch((error: errors.QueryResultError) => {
      if(error.code === errors.queryResultErrorCode.noData) {
        console.log("No results");
      } else {
        console.log(error);
      }
    });
}

export async function insertUser(user: User) {
  await getDBConnection().
    query('INSERT INTO public."User"(${this:name}) VALUES(${this:csv})', 
      user
    );
}
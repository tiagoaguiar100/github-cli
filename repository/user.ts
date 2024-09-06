
import { ParameterizedQuery as PQ } from 'pg-promise';
import { isEmpty } from 'ramda';

export interface User {
    id: string,
    name: string,
    location: string,
    languages?: string[]
}

export function getUser(db: any, username: string) {
  const findUser = new PQ({
    text: 'SELECT * FROM public."User" WHERE id = $1', 
    values: [username]
  });

  db.one(findUser)
    .then((user: any) => {
      console.log(user);
    })
    .catch((error: Error) => {
      console.log(error);
    });
}

export function getUsers(db: any) {
  const findUsers = new PQ({
    text: 'SELECT * FROM public."User"'
  });

  db.any(findUsers)
    .then((users: any) => {
      if(isEmpty(users)) {
        console.log("No results")
      } else {
        console.log(users);
      }
    })
    .catch((error: Error) => {
      console.log(error);
    });
}

export function getUsersBy(db: any, location: string, language: string) {
  let whereClause;
  let values;
  if(location && language) {
    whereClause = "LOWER(location)=LOWER($1) AND $2=ANY(languages)";
    values = [location, language];
  }
  else if(location) {
    whereClause =  "LOWER(location)=LOWER($1)";
    values = [location];
  }
  else if(language) {
    whereClause =  "$1=ANY(languages)";
    values = [language];
  }
  else {
    return getUsers(db);
  }

  const findUsers = new PQ({
    text: `SELECT * FROM public."User" WHERE ${whereClause}`, 
    values: values
  });
  
  db.any(findUsers)
    .then((users: User[]) => {
      if(isEmpty(users)) {
        console.log("No results")
      } else {
        console.log(users);
      }
    })
    .catch((error: Error) => {
      console.log(error);
    });
}

export async function insertUser(db: any, user: User) {
  await db.none('INSERT INTO public."User"(id, name, location)' +
    'VALUES(${user.id}, ${user.name}, ${user.location})', {
    user
  });

  getUser(db, user.id);
}
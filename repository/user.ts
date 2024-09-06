
import { ParameterizedQuery as PQ } from 'pg-promise';

export interface User {
    login: string,
    name: string,
    location: string,
    languages?: string[]
}

export function getUser(db: any, username: string) {
  const findUser = new PQ({
    text: 'SELECT * FROM public."User" WHERE login = $1', 
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
      console.log(users);
    })
    .catch((error: Error) => {
      console.log(error);
    });
}

export function getUsersByLocation(db: any, location: string) {
  const findUsers = new PQ({
    text: 'SELECT * FROM public."User" WHERE LOWER(location) = LOWER($1)', 
    values: [location]
  });

  db.any(findUsers)
    .then((users: any) => {
      console.log(users);
    })
    .catch((error: Error) => {
      console.log(error);
    });
}

export function getUsersByLanguage(db: any, language: string) {
  const findUsers = new PQ({
    text: 'SELECT * FROM public."User" where $1=ANY(languages)', 
    values: [language.toLowerCase()]});

  db.any(findUsers)
    .then((users: any) => {
      console.log(users);
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
    return '';
  }

  const findUsers = new PQ({
    text: `SELECT * FROM public."User" WHERE ${whereClause}`, 
    values: values
  });
  
  db.any(findUsers)
    .then((users: any) => {
      console.log(users);
    })
    .catch((error: Error) => {
      console.log(error);
    });
}

export async function insertUser(db: any, user: User) {
  await db.none('INSERT INTO public."User"(id, login, name, location) VALUES(2, ${user.login}, ${user.name}, ${user.location})', {
    user
  });

  getUser(db, user.login);
}
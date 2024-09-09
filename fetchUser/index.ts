import { isNotEmpty, uniq } from 'ramda';
import { getUser, insertUser, User } from '../repository/user';
import { get } from './util';

export const fetchUser = async (username: string) => {
  const userDb = await getUser(username, true);
  if(userDb) {
    console.log("User already exists.");
    return userDb;
  }
  const onSuccess = (response: any) => {
    let user = {};
    if(response.status && response.message){
      console.log(response.message);
      return null;
    }

    if(response && isNotEmpty(response)) {
      user = {
        id: response.login,
        name: response.name,
        location: response.location
      };
    }
    return user;
  }

  const onError = (err: any) => {
    return err.message;
  }

  return get(`https://api.github.com/users/${username}`, 
    onSuccess, 
    onError).then(async result => {
    if(result && isNotEmpty(result)) {
      const repoInfo = await fetchReposByUser(username);
      let languages: string[] = [];
      for (const repo of repoInfo) {
        languages = languages.concat(repo.languages);
      }
      const user = {...(result as User), languages: uniq(languages)}
      insertUser(user);
      console.log("User added successfully.\n", await getUser(username));
    }
  }).catch((error: Error) => console.log(error));
}

const fetchReposByUser = (username: string): Promise<any> => {
  const onSuccess = async (response: any) => {
    if(response.status && response.message){
      console.log(response.message);
      return null;
    }

    return await joinRepoLanguages(response, username);
  }

  const onError = (err: Error) => {
    console.log(err.message);
    return null;
  }

  return get(`https://api.github.com/users/${username}/repos`, 
    onSuccess, 
    onError)
}

const fetchLanguagesByRepo = (
  username: string, repository: string): Promise<any> => {
  const onSuccess = async (response: any) => {
    if(response.status && response.message){
      console.log(response.message);
      return null;
    }
    return response;
  }

  const onError = (err: Error) => {
    console.log(err.message);
    return null;
  }

  return get(`https://api.github.com/repos/` + 
      `${username}/${repository}/languages`, 
  onSuccess, 
  onError)
}

/**
 * Fetch languages from each repository and 
 * joined them with repository main language
 * 
 * @param response 
 * @param username 
 * @param repos 
 */
export async function joinRepoLanguages(
  response: any, 
  username: string) {
  const repos = [];
  for (const repo of response) {
    let moreLanguages: any;
    if (isNotEmpty(repo.language)) {
      moreLanguages = await fetchLanguagesByRepo(username, repo.name);
      const languages = moreLanguages ? 
        Object.keys(moreLanguages) : 
        [repo.language];
      repos.push({ name: repo.name, languages });
    } else {
      repos.push({ name: repo.name });
    }
  }
  return repos;
}
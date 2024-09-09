import * as https from 'https';
import { isNotEmpty, uniq } from 'ramda';
import { getUser, insertUser, User } from '../repository/user';

const headers =  { 
  'X-GitHub-Api-Version': '2022-11-28', 
  accept: 'application/vnd.github+json',
  authorization: `Bearer ${process.env["GITHUB_TOKEN"]}`,
  "user-agent": 'node.js'
};

export const fetchUser = async (username: string) => {
  const userDb = await getUser(username, true);
  if(userDb) {
    console.log("User already exists.");
  }

  const onSuccess = (response: any) => {
    let user = {};
    if(response.status && response.message){
      console.log(response.message);
    }

    if(isNotEmpty(response)) {
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

  get(`https://api.github.com/users/${username}`, 
    onSuccess, 
    onError).then(async result => {
    if(isNotEmpty(result)) {
      const repoInfo = await fetchReposByUser(username);
      let languages: string[] = [];
      for (const repo of repoInfo) {
        languages = languages.concat(repo.languages);
      }
      const user = {...(result as User), languages: uniq(languages)}
      insertUser(user);
      console.log("User added successfully.");
      getUser(username);
    }
  }).catch((error: Error) => console.error(error));
}

const fetchReposByUser = (username: string): Promise<any> => {
  const onSuccess = async (response: any) => {
    if(response.status && response.message){
      console.log(response.message);
    }

    return await joinRepoLanguages(response, username);
  }

  const onError = (err: Error) => {
    return err.message;
  }

  return get(`https://api.github.com/users/${username}/repos`, 
    onSuccess, 
    onError)
}

const fetchLanguagesByRepo = (username: string, repository: string) => {
  const onSuccess = async (response: any) => {
    return response;
  }

  const onError = (err: Error) => {
    return err.message;
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
async function joinRepoLanguages(
  response: any, 
  username: string) {
  const repos = []
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

function get(
  url: string, 
  onSuccess: any, 
  onError: any) {
  return new Promise((resolve, reject) => {
    https.get(url, 
      {headers}, res => {
        const data: any[] = [];    
        res.on('data', chunk => {
          data.push(chunk);
        });
  
        res.on('end', () => {
          const response = JSON.parse(Buffer.concat(data).toString());
          resolve(onSuccess(response));
        });
      }).on('error', err => {
      reject(onError(err));
    });
  });
};
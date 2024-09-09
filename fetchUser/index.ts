import * as https from 'https';
import { isEmpty, isNotEmpty, uniq } from 'ramda';
import { getUser, insertUser, User } from '../repository/user';

const headers =  { 
  'X-GitHub-Api-Version': '2022-11-28', 
  accept: 'application/vnd.github+json',
  authorization: `Bearer ${process.env["GITHUB_TOKEN"]}`,
  "user-agent": 'node.js'
};

export const fetchUser = async (username: string) => {
  new Promise((resolve, reject) => {
    https.get(`https://api.github.com/users/${username}`, 
      {headers}, res => {
        const data: any[] = [];    
        res.on('data', chunk => {
          data.push(chunk);
        });
    
        res.on('end', () => {
          const response = JSON.parse(Buffer.concat(data).toString());
          let user = {};
          if(response.status && response.message){
            reject(response.message);
          }

          if(isNotEmpty(response)) {
            user = {
              id: response.login,
              name: response.name,
              location: response.location
            };
          }
          resolve(user)
        });
      }).on('error', err => {
      reject(err.message);
    });
  }).then(async result => {
    if(isNotEmpty(result)) {
      const repoInfo = await fetchReposByUser(username);
      let languages: string[] = [];
      for (const repo of repoInfo) {
        languages = languages.concat(repo.languages);
      }
      const user = {...(result as User), languages: uniq(languages)}

      const userDb = getUser(username, true);
      if(isEmpty(userDb)) {
        insertUser(user as User);
        console.log("User added successfully.");
        getUser(username);
      } else {
        console.log("User already exists.");
      }
    }
  }).catch(error => console.error(error));
}

const fetchReposByUser = (username: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    https.get(`https://api.github.com/users/${username}/repos`, 
      {headers}, res => {
        const data: any[] = [];        
        res.on('data', chunk => {
          data.push(chunk);
        });
        
        res.on('end', async () => {
          const response = JSON.parse(Buffer.concat(data).toString());
          if(response.status && response.message){
            reject(response.message);
          }

          resolve(await joinRepoLanguages(response, username));
        });
      }).on('error', err => {
      reject(err.message);
    });
  });
}

const fetchLanguagesByRepo = (username: string, repository: any) => {
  return new Promise((resolve, reject) => {
    https.get(`https://api.github.com/repos/` + 
      `${username}/${repository}/languages`, 
    {headers}, res => {

      const data: any[] = [];        
      res.on('data', chunk => {
        data.push(chunk);
      });
        
      res.on('end', () => {
        const languages = JSON.parse(Buffer.concat(data).toString());
        resolve(languages);
      });
    }).on('error', err => {
      console.log('Error: ', err.message);
      reject(err);
    });
  });
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
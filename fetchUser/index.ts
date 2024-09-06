import * as https from 'https';
import { isNotEmpty } from 'ramda';
import { insertUser, User } from '../repository/user';

const headers =  { 
  'X-GitHub-Api-Version': '2022-11-28', 
  accept: 'application/vnd.github+json',
  authorization: `Bearer ${process.env["GITHUB_TOKEN"]}`,
  "user-agent": 'node.js'
};

export const fetchUser = async (db: any, username: any) => {
  let user = {} as User;
  https.get(`https://api.github.com/users/${username}`, 
    {headers}, res => {
      const data: any[] = [];    
      res.on('data', chunk => {
        data.push(chunk);
      });
    
      res.on('end', () => {
        const response = JSON.parse(Buffer.concat(data).toString());
        console.log(response.login, response.name, response.location);
        user = {
          login: response.login,
          name: response.name,
          location: response.location.toLowerCase()
        }
      });
    }).on('error', err => {
    console.log('Error: ', err.message);
  });

  const repoInfo = await fetchReposByUser(username);
  console.log(repoInfo);

  insertUser(db, user);
}

const fetchReposByUser = (username: string) => {
  return new Promise((resolve, reject) => {
    https.get(`https://api.github.com/users/${username}/repos`, 
      {headers}, res => {
        const data: any[] = [];        
        res.on('data', chunk => {
          data.push(chunk);
        });
        
        res.on('end', async () => {
          const response = JSON.parse(Buffer.concat(data).toString());
          resolve(await joinRepoLanguages(response, username));
        });
      }).on('error', err => {
      console.log('Error: ', err.message);
      reject(err);
    });
  });
}

const fetchLanguagesByRepo = (username: any, repository: any) => {
  return new Promise((resolve, reject) => {
    https.get(`https://api.github.com/repos/${username}/${repository}/languages`, 
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
async function joinRepoLanguages(response: any, username: any) {
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

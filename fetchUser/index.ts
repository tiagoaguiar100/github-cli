import * as https from 'https';
import { isNotEmpty } from 'ramda';

const headers =  { 
    'X-GitHub-Api-Version': '2022-11-28', 
    accept: 'application/vnd.github+json',
    authorization: `Bearer ${process.env["GITHUB_TOKEN"]}`,
    "user-agent": 'node.js'
};

export const fetchUser = async (username: any) => {
    https.get(`https://api.github.com/users/${username}`, {headers}, res => {
        let data: any[] = [];    
        res.on('data', chunk => {
            data.push(chunk);
        });
    
        res.on('end', () => {
            const user = JSON.parse(Buffer.concat(data).toString());
            console.log('User:', user.login, user.name, user.location);
        });
    }).on('error', err => {
        console.log('Error: ', err.message);
    });

    const repoInfo = await fetchReposByUser(username);
    console.log(repoInfo);
}

const fetchReposByUser = (username: any) => {
    return new Promise((resolve, reject) => {
        https.get(`https://api.github.com/users/${username}/repos`, {headers}, res => {
            let data: any[] = [];        
            res.on('data', chunk => {
                data.push(chunk);
            });
        
            res.on('end', async () => {
                const response = JSON.parse(Buffer.concat(data).toString());
                let repos = [];
                for (const repo of response) {
                    let moreLanguages: any;
                    if(isNotEmpty(repo.language))  {
                        moreLanguages = await fetchLanguagesByRepo(username, repo.name);
                        const language = moreLanguages ? Object.keys(moreLanguages) : [repo.language];
                        repos.push({name: repo.name, language: language})
                    } else {
                        repos.push({name: repo.name})
                    }
                }
                resolve(repos);
            });
        }).on('error', err => {
            console.log('Error: ', err.message);
            reject(err);
        });
    });
}

const fetchLanguagesByRepo = (username: any, repository: any) => {
    return new Promise((resolve, reject) => {
            https.get(`https://api.github.com/repos/${username}/${repository}/languages`, {headers}, res => {

            let data: any[] = [];        
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
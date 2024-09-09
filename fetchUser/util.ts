import * as https from 'https';

const headers =  { 
  'X-GitHub-Api-Version': '2022-11-28', 
  accept: 'application/vnd.github+json',
  authorization: `Bearer ${process.env["GITHUB_TOKEN"]}`,
  "user-agent": 'node.js'
};

export function get(
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
/* eslint-disable max-len */
import { join } from "path";
import { QueryFile } from "pg-promise";

/**
 * Code from pg-promise documentation as is
 * https://github.com/vitaly-t/pg-promise-demo/blob/master/JavaScript/db/sql/index.js
 * @param file 
 * @returns 
 */
export function run_sql(file: string) {

  const fullPath = join(__dirname, file); // generating full path;

  const options = {

    // minifying the SQL is always advised;
    // see also option 'compress' in the API;
    minify: true

    // See also property 'params' for two-step template formatting
  };

  console.log(fullPath);
  const qf = new QueryFile(fullPath, options);

  if (qf.error) {
    // Something is wrong with our query file :(
    // Testing all files through queries can be cumbersome,
    // so we also report it here, while loading the module:
    console.error(qf.error);
  }

  return qf;

  // See QueryFile API:
  // http://vitaly-t.github.io/pg-promise/QueryFile.html
}
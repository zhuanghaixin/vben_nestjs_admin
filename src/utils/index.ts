import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';

export function getMysqlUsernameAndPassword() {
  const homedir = os.homedir();
  const usernamePath = path.resolve(homedir, '.vben', 'username');
  const passwordPath = path.resolve(homedir, '.vben', 'password');
  const username = fs.readFileSync(usernamePath).toString().trim();
  const password = fs.readFileSync(passwordPath).toString().trim();
  return { username, password };
}

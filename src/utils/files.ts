import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';

const luoguPath = path.resolve(os.homedir(), '.luogu');

fs.rm(path.resolve(luoguPath, 'luogu.json'), () => {});

export const saveUserIconCache = function (uid: number, image: Buffer) {
  fs.writeFileSync(path.join(luoguPath, `${uid}.jpg`), image);
  fs.writeFileSync(
    path.join(luoguPath, `${uid}.savetime.txt`),
    new Date().getTime().toString()
  );
};
export const loadUserIconCache = function (uid: number) {
  if (
    fs.existsSync(path.join(luoguPath, `${uid}.jpg`)) &&
    fs.existsSync(path.join(luoguPath, `${uid}.savetime.txt`)) &&
    new Date().getTime() -
      parseInt(
        fs.readFileSync(path.join(luoguPath, `${uid}.savetime.txt`)).toString()
      ) <=
      +vscode.workspace
        .getConfiguration('luogu')
        .get<'integer'>('effectiveDuration')! &&
    parseInt(
      fs.readFileSync(path.join(luoguPath, `${uid}.savetime.txt`)).toString()
    ) > 1698564000
  )
    // 此时的用户头像存储方式由 base64 转为了二进制，以前的缓存直接失效
    return fs.readFileSync(path.join(luoguPath, `${uid}.jpg`));
  else return null;
};

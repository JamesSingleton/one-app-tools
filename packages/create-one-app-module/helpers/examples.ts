import got from 'got';
import tar from 'tar';
import { Stream } from 'stream';
import { promisify } from 'util';

const pipeline = promisify(Stream.pipeline);

export type RepositoryInformation = {
  username: string;
  name: string;
  branch: string;
  filePath: string;
};

export async function isUrlOk(url: string): Promise<boolean> {
  const response = await got.head(url).catch((e) => e);
  return response.statusCode === 200;
}

export async function getRepositoryInforation(
  url: URL,
  examplePath?: string
): Promise<RepositoryInformation | undefined> {
  const [, username, name, t, _branch, ...file] = url.pathname.split('/');
  const filePath = examplePath
    ? examplePath.replace(/^\//, '')
    : file.join('/');

  if (t === undefined) {
    const infoResponse = await got(
      `https://api.github.com/repos/${username}/${name}`
    ).catch((e) => e);

    if (infoResponse.statusCode !== 200) {
      return;
    }

    const info = JSON.parse(infoResponse.body);
    return { username, name, branch: info['default_branch'], filePath };
  }

  const branch = examplePath
    ? `${_branch}/${file.join('/')}`.replace(new RegExp(`/${filePath}|/$`), '')
    : _branch;

  if (username && name && branch && t === 'tree') {
    return { username, name, branch, filePath };
  }
}

export function hasRepository({
  username,
  name,
  branch,
  filePath,
}: RepositoryInformation): Promise<boolean> {
  const contentsUrl = `https://api.github.com/repos/${username}/${name}/contents`;
  const packagePath = `${filePath ? `/${filePath}` : ''}/package.json`;

  return isUrlOk(contentsUrl + packagePath + `?ref=${branch}`);
}

export function hasExample(name: string): Promise<boolean> {
  return isUrlOk(
    `https://api.github.com/repos/JamesSingleton/learn-one-app-examples/contents/examples/${encodeURIComponent(
      name
    )}/package.json`
  );
}

export function downloadAndExtractRepo(
  root: string,
  { username, name, branch, filePath }: RepositoryInformation
): Promise<void> {
  return pipeline(
    got.stream(
      `https://codeload.github.com/${username}/${name}/tar.gz/${branch}`
    ),
    tar.extract(
      { cwd: root, strip: filePath ? filePath.split('/').length + 1 : 1 },
      [`${name}-${branch}${filePath ? `/${filePath}` : ''}`]
    )
  );
}

export function downloadAndExtractExample(
  root: string,
  name: string
): Promise<void> {
  if (name === '__internal-testing-retry') {
    throw new Error('This is an internal example for testing the CLI.');
  }

  return pipeline(
    got.stream(
      'https://codeload.github.com/JamesSingleton/learn-one-app-examples/tar.gz/master'
    ),
    tar.extract({ cwd: root, strip: 3 }, [
      `learn-one-app-examples-master/examples/${name}`,
    ])
  );
}

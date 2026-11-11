export interface AppVersionInfo {
  versionCode: number;
  versionName: string;
  commitHash: string;
  releaseDate: string;
  repo: string;
}

export interface AppUpdateManifest {
  versionCode: number;
  versionName: string;
  commitHash: string;
  releaseDate: string;
  repo: string;
  branch: string;
  title: string;
  changelog: string[];
  apkUrl: string;
  releaseUrl: string;
  isMandatory?: boolean;
}

export const CURRENT_APP_VERSION: AppVersionInfo = {
  versionCode: 21,
  versionName: '1.3.8',
  commitHash: '904bb448253df91448ab02828cd6dd2482666aa2',
  releaseDate: '2026-11-11',
  repo: 'Boltsky/NETFLIX'
};

export const VERSION_MANIFEST_URL = 'https://raw.githubusercontent.com/Boltsky/NETFLIX/main/version.json';

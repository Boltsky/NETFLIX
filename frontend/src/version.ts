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
  versionCode: 23,
  versionName: '1.4.0',
  commitHash: 'latest',
  releaseDate: '2026-11-13',
  repo: 'Boltsky/NETFLIX'
};

export const VERSION_MANIFEST_URL = 'https://raw.githubusercontent.com/Boltsky/NETFLIX/main/version.json';

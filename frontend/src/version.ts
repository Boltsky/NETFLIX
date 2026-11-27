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
  versionCode: 32,
  versionName: '1.4.9',
  commitHash: 'latest',
  releaseDate: '2026-11-27',
  repo: 'Boltsky/NETFLIX'
};

export const RELEASE_HUB_URL = 'https://boltsky-release-hub.vercel.app';
export const VERSION_MANIFEST_URL = `${RELEASE_HUB_URL}/api/updates/netflix-tv/latest.json`;

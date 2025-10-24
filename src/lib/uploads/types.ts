export interface IUploadAvatarResult {
  success: boolean;
  data?: {
    avatar_url: string;
    path: string;
  };
  error?: string;
}

export interface IDeleteAvatarResult {
  success: boolean;
  error?: string;
}

export interface IUpdateAvatarResult {
  success: boolean;
  data?: {
    avatar_url: string;
    path: string;
  };
  error?: string;
}

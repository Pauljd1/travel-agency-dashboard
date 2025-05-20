export interface UserData {
  id?: string;
  user_id: string;
  name: string;
  email: string;
  status: string;
  image_url?: string;
  joined_at?: string;
}

/**
 * Loader data structure for the AllUsers route
 */
export interface LoaderData {
  users: UserData[];
  total: number;
  error?: string;
}


/**
 * Type for use with userService methods
 */
export interface UserServiceResponse {
  users: UserData[];
  total: number;
  error?: string;
}

/**
 * Type for profile creation response
 */
export interface ProfileCreationResponse {
  profile?: UserData;
  error?: string;
}
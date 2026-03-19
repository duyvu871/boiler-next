// Example user types, to be placed correctly in your type files
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

export interface UpdateUserInput {
  name?: string;
}

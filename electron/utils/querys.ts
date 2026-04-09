import { type Database } from "better-sqlite3";

export const prepareQuery = (query: string, db: Database) => db.prepare(query);

export const returnObjetToResponseApi = <T = null>(
  success: boolean,
  message: any,
  data?: T,
): ApiResponseDB<T> => {
  return {
    success,
    message,
    data,
  };
};

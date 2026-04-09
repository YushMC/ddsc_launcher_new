export const prepareQuery = (query, db) => db.prepare(query);
export const returnObjetToResponseApi = (success, message, data) => {
    return {
        success,
        message,
        data,
    };
};

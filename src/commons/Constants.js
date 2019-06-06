/**
 * API URL
 */
const apiBaseUrl = process.env.REACT_APP_API_URL;

export const ApiUrl = {
    report:'report'
};

Object.keys(ApiUrl).map((key) => (ApiUrl[key] = apiBaseUrl + ApiUrl[key]));
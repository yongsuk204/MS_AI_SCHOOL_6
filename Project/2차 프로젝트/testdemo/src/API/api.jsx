// src/api/api.js
import axios from "axios";

export const api = axios.create({
  baseURL:
    "https://korean-history-api-g7auebfdhhd6fpb5.koreacentral-01.azurewebsites.net",
});

import axios from 'axios';
import axiosCaseConverter from 'simple-axios-case-converter';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

axiosCaseConverter(axios);

const getAuthHeaders = (accessToken: string | undefined) => ({
  Authorization: `Bearer ${accessToken}`,
  'Content-Type': 'application/json',
});

export async function axiosGet<P>(url: string, accessToken: string | undefined, params?: P) {
  const headers = getAuthHeaders(accessToken);
  return await axios.get(`${BASE_URL}${url}`, { params, headers });
}

export async function axiosPost<P>(url: string, accessToken: string | undefined, params: P) {
  const headers = getAuthHeaders(accessToken);
  return await axios.post(`${BASE_URL}${url}`, params, { headers });
}

export async function axiosPatch<P>(url: string, accessToken: string | undefined, params: P) {
  const headers = getAuthHeaders(accessToken);
  return await axios.patch(`${BASE_URL}${url}`, params, { headers });
}

export async function axiosDelete(url: string, accessToken: string | undefined) {
  const headers = getAuthHeaders(accessToken);
  return await axios.delete(`${BASE_URL}${url}`, { headers });
}

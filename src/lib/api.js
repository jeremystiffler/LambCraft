import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const loginPlayer = async (username) => {
  const { data } = await axios.post(`${API}/players/login`, { username });
  return data;
};

export const savePlayer = async (state) => {
  const { data } = await axios.post(`${API}/players/save`, state);
  return data;
};

export const fetchLeaderboard = async () => {
  const { data } = await axios.get(`${API}/leaderboard`);
  return data;
};

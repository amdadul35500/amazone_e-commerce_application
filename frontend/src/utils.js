export const getError = (error) => {
  return error.response && error.response.data.message
    ? error.response.data.message
    : error.message;
};

export const base_url = "https://amazone-api.vercel.app";

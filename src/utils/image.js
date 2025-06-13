const URL_BE = import.meta.env.VITE_API_URL
const ENDPOINT = "/files/avatar/"

export function getURLAvatar(avatarName) {
    return URL_BE + ENDPOINT + avatarName;
}
  
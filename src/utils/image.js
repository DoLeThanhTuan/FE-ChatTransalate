const URL_BE = import.meta.env.VITE_API_URL
const ENDPOINT = "/files/avatar/"

export function getURLAvatar(avatarName) {
    if (!avatarName) {
        return new URL('@/assets/default-avatar.png', import.meta.url).href;
    }
    return URL_BE + ENDPOINT + avatarName;
}
  
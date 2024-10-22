/* eslint camelcase: 0 */

import axios from "axios";

const tokenConfig = (token) => ({
    headers: {
        Authorization: token, // eslint-disable-line quote-props
    },
});

export function validate_token(token) {
    return axios.post("/api/is_token_valid", {
        token,
    });
}

export function get_github_access() {
    window.open(
        "/github-login",
        "_blank" // <- This is what makes it open in a new window.
    );
}

export function create_user(name, email, password) {
    return axios.post("api/create_user", {
        name,
        email,
        password,
    });
}

export function get_token(email, password) {
    return axios.post("api/get_token", {
        email,
        password,
    });
}

export function has_github_token(token) {
    return axios.get("api/has_github_token", tokenConfig(token));
}

export function data_about_user(token) {
    return axios.get("api/user", tokenConfig(token));
}

// --------- SERVER FUNCTIONS -------------
export function create_server(
    userID,
    hostname,
    port,
    username,
    password,
    key_filename,
    serverName
) {
    return axios.post("api/create_server", {
        userID,
        hostname,
        port,
        username,
        password,
        key_filename,
        serverName,
    });
}

export function data_about_servers(userID) {
    return axios.post("api/servers_with_user", {
        userID,
    });
}

export function detect_server(
    userID,
    hostname,
    port,
    username,
    password,
    key_filename
) {
    return axios.post("api/detect_server", {
        userID,
        hostname,
        port,
        username,
        password,
        key_filename,
    });
}

export function get_detection_status(hostname) {
    return axios.post("api/get_detection_status", {
        hostname,
    });
}

export function stop_server_detect(hostname) {
    return axios.post("api/stop_server_detect", {
        hostname,
    });
}

export function get_analytics_data(
    hostname,
    port,
    username,
    password,
    key_filename
) {
    return axios.post("api/get_analytics_data", {
        hostname,
        port,
        username,
        password,
        key_filename,
    });
}

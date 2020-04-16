import {
    FETCH_PROTECTED_DATA_REQUEST,
    RECEIVE_PROTECTED_DATA,
    CREATE_SERVER_REQUEST,
    CREATE_SERVER_SUCCESS,
    CREATE_SERVER_FAILURE,
    FETCH_SERVER_DATA_REQUEST,
    RECEIVE_SERVER_DATA,
    DETECT_SERVER_REQUEST,
    DETECT_SERVER_SUCCESS,
    DETECT_SERVER_FAILURE,
    DETECT_SERVER_STATUS_REQUEST,
    DETECT_SERVER_STATUS_SUCCESS,
    DETECT_SERVER_STATUS_FAILURE,
    STOP_SERVER_DETECT_REQUEST,
    STOP_SERVER_DETECT_SUCCESS,
    STOP_SERVER_DETECT_FAILURE,
} from "../constants/index";
import { parseJSON } from "../utils/misc";
import {
    data_about_user,
    create_server,
    data_about_servers,
    detect_server,
    get_detection_status,
    stop_server_detect,
} from "../utils/http_functions";
import { logoutAndRedirect } from "./auth";

// ------------- FETCH PROTECTED DATA -----------------
export function receiveProtectedData(data) {
    return {
        type: RECEIVE_PROTECTED_DATA,
        payload: {
            data,
        },
    };
}

export function fetchProtectedDataRequest() {
    return {
        type: FETCH_PROTECTED_DATA_REQUEST,
    };
}

export function fetchProtectedData(token) {
    return (dispatch) => {
        dispatch(fetchProtectedDataRequest());
        data_about_user(token)
            .then(parseJSON)
            .then((response) => {
                dispatch(receiveProtectedData(response));
            })
            .catch((error) => {
                if (error.status === 401) {
                    dispatch(logoutAndRedirect(error));
                }
            });
    };
}

// ------------- SERVER CREATORS -----------------
export function createServerRequest() {
    return {
        type: CREATE_SERVER_REQUEST,
    };
}

export function createServerSuccess(status) {
    localStorage.setItem("serverCreationStatus", status);
    return {
        type: CREATE_SERVER_SUCCESS,
        payload: {
            status,
        },
    };
}

export function createServerFailure(error) {
    localStorage.removeItem("serverCreationStatus");
    console.log(error.response);
    return {
        type: CREATE_SERVER_FAILURE,
        payload: {
            status: 412,
            statusText: error.response.data.message,
        },
    };
}

export function createServer(
    userID,
    hostname,
    port,
    username,
    password,
    key_filename
) {
    return function (dispatch) {
        dispatch(createServerRequest());
        return create_server(
            userID,
            hostname,
            port,
            username,
            password,
            key_filename
        )
            .then(parseJSON)
            .then((response) => {
                try {
                    dispatch(createServerSuccess(response.status));
                } catch (e) {
                    dispatch(
                        createServerFailure({
                            response: {
                                status: 403,
                                statusText: "Server already exists",
                            },
                        })
                    );
                }
            })
            .catch((error) => {
                dispatch(createServerFailure(error));
            });
    };
}

// ------------- FETCH SERVER DATA -----------------
export function receiveServerData(servers) {
    console.log("payload:");
    console.log(servers);
    return {
        type: RECEIVE_SERVER_DATA,
        payload: {
            servers,
        },
    };
}

export function fetchServerDataRequest() {
    return {
        type: FETCH_SERVER_DATA_REQUEST,
    };
}

export function fetchServerData(userID) {
    console.log("fetch server data");
    return (dispatch) => {
        dispatch(fetchServerDataRequest());
        data_about_servers(userID)
            .then(parseJSON)
            .then((response) => {
                dispatch(receiveServerData(response));
            })
            .catch((error) => {
                if (error.status === 401) {
                    dispatch(logoutAndRedirect(error));
                }
            });
    };
}

// ------------- START DETECT SERVER -----------------
export function detectServerRequest() {
    return {
        type: DETECT_SERVER_REQUEST,
    };
}

export function detectServerSuccess(status) {
    localStorage.setItem("serverCreationStatus", status);
    return {
        type: DETECT_SERVER_SUCCESS,
        payload: {
            status,
        },
    };
}

export function detectServerFailure(error) {
    localStorage.removeItem("serverCreationStatus");
    console.log(error.response);
    return {
        type: DETECT_SERVER_FAILURE,
        payload: {
            status: 412,
            statusText: error.response.data.message,
        },
    };
}

export function detectServer(
    userID,
    hostname,
    port,
    username,
    password,
    key_filename
) {
    return function (dispatch) {
        dispatch(detectServerRequest());
        return detect_server(
            userID,
            hostname,
            port,
            username,
            password,
            key_filename
        )
            .then(parseJSON)
            .then((response) => {
                try {
                    dispatch(detectServerSuccess(response.status));
                } catch (e) {
                    dispatch(
                        detectServerFailure({
                            response: {
                                status: 403,
                                statusText: "Detect server error",
                            },
                        })
                    );
                }
            })
            .catch((error) => {
                dispatch(detectServerFailure(error));
            });
    };
}

// ------------- DETECT SERVER STATUS-----------------

export function detectServerStatusRequest() {
    return {
        type: DETECT_SERVER_STATUS_REQUEST,
    };
}

export function detectServerStatusSuccess(status) {
    console.log;
    return {
        type: DETECT_SERVER_STATUS_SUCCESS,
        payload: {
            status,
        },
    };
}

export function detectServerStatusFailure(error) {
    return {
        type: DETECT_SERVER_STATUS_FAILURE,
        payload: {
            status: 412,
            statusText: error.response.data.message,
        },
    };
}

export function getDetectionStatus(hostname) {
    console.log("det status");
    return function (dispatch) {
        dispatch(detectServerStatusRequest());
        return get_detection_status(hostname)
            .then(parseJSON)
            .then((response) => {
                try {
                    dispatch(detectServerStatusSuccess(response.status));
                } catch (e) {
                    dispatch(
                        detectServerStatusFailure({
                            response: {
                                status: 403,
                                statusText: "Detect server error",
                            },
                        })
                    );
                }
            })
            .catch((error) => {
                dispatch(detectServerFailure(error));
            });
    };
}

// ------------- STOP DETECT SERVER -----------------

export function stopServerDetectRequest() {
    return {
        type: STOP_SERVER_DETECT_REQUEST,
    };
}

export function stopServerDetectSuccess(status) {
    return {
        type: STOP_SERVER_DETECT_SUCCESS,
        payload: {
            status,
        },
    };
}

export function stopServerDetectFailure(error) {
    console.log(error.response);
    return {
        type: STOP_SERVER_DETECT_FAILURE,
        payload: {
            status: 412,
            statusText: error.response.data.message,
        },
    };
}

export function stopServerDetect(hostname) {
    return function (dispatch) {
        dispatch(stopServerDetectRequest());
        return stop_server_detect(hostname)
            .then(parseJSON)
            .then((response) => {
                try {
                    dispatch(stopServerDetectSuccess(response.status));
                } catch (e) {
                    dispatch(
                        detectServerFailure({
                            response: {
                                status: 403,
                                statusText: "Detect server error",
                            },
                        })
                    );
                }
            })
            .catch((error) => {
                dispatch(stopServerDetectFailure(error));
            });
    };
}

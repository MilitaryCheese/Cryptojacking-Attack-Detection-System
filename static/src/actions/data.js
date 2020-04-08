import {
    FETCH_PROTECTED_DATA_REQUEST,
    RECEIVE_PROTECTED_DATA,
    CREATE_SERVER_REQUEST,
    CREATE_SERVER_SUCCESS,
    CREATE_SERVER_FAILURE,
} from "../constants/index";
import { parseJSON } from "../utils/misc";
import { data_about_user, create_server } from "../utils/http_functions";
import { logoutAndRedirect } from "./auth";

export function receiveProtectedData(data) {
    console.log("payload:");
    console.log(data);
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

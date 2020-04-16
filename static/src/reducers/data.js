import {
    RECEIVE_PROTECTED_DATA,
    FETCH_PROTECTED_DATA_REQUEST,
    CREATE_SERVER_REQUEST,
    CREATE_SERVER_SUCCESS,
    CREATE_SERVER_FAILURE,
    RECEIVE_SERVER_DATA,
    FETCH_SERVER_DATA_REQUEST,
    DETECT_SERVER_REQUEST,
    DETECT_SERVER_SUCCESS,
    DETECT_SERVER_FAILURE,
    DETECT_SERVER_STATUS_REQUEST,
    DETECT_SERVER_STATUS_SUCCESS,
    DETECT_SERVER_STATUS_FAILURE,
} from "../constants";
import { createReducer } from "../utils/misc";

const initialState = {
    data: null,
    isFetching: false,
    loaded: false,
    serverStatus: false,
    serverDetection: false,
    createServerStatusText: null,
    detectServerStatusText: null,
    usersServers: [],
    currentServerCurrentStatus: null,
};

export default createReducer(initialState, {
    [RECEIVE_PROTECTED_DATA]: (state, payload) =>
        Object.assign({}, state, {
            data: payload.data,
            isFetching: false,
            loaded: true,
        }),
    [FETCH_PROTECTED_DATA_REQUEST]: (state) =>
        Object.assign({}, state, {
            isFetching: true,
        }),

    [CREATE_SERVER_REQUEST]: (state) =>
        Object.assign({}, state, {
            isAuthenticating: true,
            serverStatus: "requesting",
        }),
    [CREATE_SERVER_SUCCESS]: (state, payload) =>
        Object.assign({}, state, {
            serverStatus: payload,
            createServerStatusText: "Successfully added a server!",
        }),
    [CREATE_SERVER_FAILURE]: (state, payload) =>
        Object.assign({}, state, {
            serverStatus: false,
            createServerStatusText:
                "Oops! Something went wrong: " + payload.statusText + "!",
        }),

    [RECEIVE_SERVER_DATA]: (state, payload) =>
        Object.assign({}, state, {
            usersServers: payload.servers,
            isFetching: false,
            loaded: true,
        }),
    [FETCH_SERVER_DATA_REQUEST]: (state) =>
        Object.assign({}, state, {
            isFetching: true,
        }),

    [DETECT_SERVER_REQUEST]: (state) =>
        Object.assign({}, state, {
            isAuthenticating: true,
            serverDetection: "requesting",
        }),
    [DETECT_SERVER_SUCCESS]: (state, payload) =>
        Object.assign({}, state, {
            serverDetection: payload, //true or false
            detectServerStatusText: "Successfully added a server!",
        }),
    [DETECT_SERVER_FAILURE]: (state, payload) =>
        Object.assign({}, state, {
            serverDetection: false,
            detectServerStatusText:
                "Oops! Something went wrong: " + payload.statusText + "!",
        }),

    [DETECT_SERVER_STATUS_REQUEST]: (state) =>
        Object.assign({}, state, {
            isAuthenticating: true,
            currentServerCurrentStatus: "requesting",
        }),
    [DETECT_SERVER_STATUS_SUCCESS]: (state, payload) =>
        Object.assign({}, state, {
            currentServerCurrentStatus: payload.status, //true or false
        }),
    [DETECT_SERVER_STATUS_FAILURE]: (state, payload) =>
        Object.assign({}, state, {
            currentServerCurrentStatus: false,
        }),
});

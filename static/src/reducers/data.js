import {
    RECEIVE_PROTECTED_DATA,
    FETCH_PROTECTED_DATA_REQUEST,
    CREATE_SERVER_REQUEST,
    CREATE_SERVER_SUCCESS,
    CREATE_SERVER_FAILURE,
} from "../constants";
import { createReducer } from "../utils/misc";

const initialState = {
    data: null,
    isFetching: false,
    loaded: false,
    serverStatus: false,
    createServerStatusText: null,
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
});

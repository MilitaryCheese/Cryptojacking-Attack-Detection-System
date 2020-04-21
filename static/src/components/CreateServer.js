import React from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
// import * as actionCreators from "../actions/auth";
import * as actionCreators from "../actions/data";
import TextField from "material-ui/TextField";
import RaisedButton from "material-ui/RaisedButton";
import Paper from "material-ui/Paper";
import SelectField from "material-ui/SelectField";
import MenuItem from "material-ui/MenuItem";

function mapStateToProps(state) {
    return {
        isRegistering: state.auth.isRegistering,
        registerStatusText: state.auth.registerStatusText,
        data: state.data.data,
        token: state.auth.token,
        loaded: state.data.loaded,
        isFetching: state.data.isFetching,
        createServerStatusText: state.data.createServerStatusText,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(actionCreators, dispatch);
}

const style = {
    marginTop: 50,
    paddingBottom: 50,
    paddingTop: 25,
    paddingLeft: 50,
    paddingRight: 50,
    width: "100%",
    display: "inline-block",
};

@connect(mapStateToProps, mapDispatchToProps)
class CreateServer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userID: "",
            hostname: "",
            serverName: "",
            port: "",
            username: "",
            password: "",
            key_filename: "",
            hostname_error_text: null,
            disabled: true,
        };
    }

    componentDidMount() {
        this.fetchData();
    }

    fetchData() {
        const token = this.props.token;
        this.props.fetchProtectedData(token);
    }

    create_server(e) {
        e.preventDefault();
        this.state.userID = this.props.data._id.$oid;
        this.props.createServer(
            this.state.userID,
            this.state.hostname,
            this.state.port,
            this.state.username,
            this.state.password,
            this.state.key_filename,
            this.state.serverName
        );
    }

    _handleKeyPress(e) {
        if (e.key === "Enter") {
            if (!this.state.disabled) {
                this.create_server(e);
            }
        }
    }

    isDisabled() {
        let hostname_is_valid = false;

        if (this.state.hostname === "") {
            this.setState({
                hostname_error_text: "Sorry, this is not a valid hostname",
            });
        } else {
            hostname_is_valid = true;
            this.setState({
                hostname_error_text: null,
            });
        }
        if (hostname_is_valid) {
            this.setState({
                disabled: false,
            });
        }
    }

    changeValue(e, type) {
        const value = e.target.value;
        const next_state = {};
        next_state[type] = value;
        this.setState(next_state, () => {
            this.isDisabled();
        });
    }

    render() {
        return (
            <div className="col-md-8">
                <h1>Add Server to your Account</h1>
                <hr />
                <div className="col-md-12">
                    <TextField
                        hintText="Sever Name"
                        floatingLabelText="Server Name"
                        type="text"
                        onChange={(e) => this.changeValue(e, "serverName")}
                    />
                </div>
                <div className="col-md-12">
                    <TextField
                        hintText="Hostname"
                        floatingLabelText="Hostname"
                        type="text"
                        errorText={this.state.hostname_error_text}
                        onChange={(e) => this.changeValue(e, "hostname")}
                    />
                </div>
                <div className="col-md-12">
                    <TextField
                        hintText="Port"
                        floatingLabelText="Port"
                        type="number"
                        onChange={(e) => this.changeValue(e, "port")}
                    />
                </div>
                <div className="col-md-12">
                    <TextField
                        hintText="Username"
                        floatingLabelText="Username"
                        type="text"
                        onChange={(e) => this.changeValue(e, "username")}
                    />
                </div>
                <div className="col-md-12">
                    <TextField
                        hintText="Password"
                        floatingLabelText="Password"
                        type="password"
                        onChange={(e) => this.changeValue(e, "password")}
                    />
                </div>
                <div className="col-md-12">
                    <TextField
                        hintText="Key Location"
                        floatingLabelText="Key Location"
                        type="text"
                        onChange={(e) => this.changeValue(e, "key_filename")}
                    />
                </div>
                <RaisedButton
                    disabled={this.state.disabled}
                    style={{ marginTop: 50 }}
                    label="Create Server"
                    onClick={(e) => this.create_server(e)}
                />
            </div>
        );
    }
}

export default CreateServer;

import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as actionCreators from "../actions/data";
import TextField from "material-ui/TextField";
import RaisedButton from "material-ui/RaisedButton";
import Paper from "material-ui/Paper";
// import InputLabel from "@material-ui/core/InputLabel";
// import Select from "@material-ui/core/Select";
// import MenuItem from "@material-ui/core/MenuItem";

function mapStateToProps(state) {
    return {
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
    width: "100%",
    textAlign: "center",
    display: "inline-block",
};

@connect(mapStateToProps, mapDispatchToProps)
export default class ProtectedView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userID: "",
            hostname: "",
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
            this.state.key_filename
        );
    }

    changeValue(e, type) {
        const value = e.target.value;
        const next_state = {};
        next_state[type] = value;
        this.setState(next_state, () => {
            this.isDisabled();
        });
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

    render() {
        return (
            <div>
                <div>
                    {!this.props.loaded ? (
                        <h1>Loading data...</h1>
                    ) : (
                        <div>
                            <h1>
                                Welcome back,&nbsp;
                                {this.props.data.name}!
                            </h1>
                        </div>
                    )}
                </div>
                <div>
                    <Paper style={style}>
                        <div className="text-center">
                            <h2>Add a server to your account</h2>
                            {this.props.createServerStatusText && (
                                <div className="alert alert-info">
                                    {this.props.createServerStatusText}
                                </div>
                            )}

                            <div className="col-md-12">
                                <TextField
                                    hintText="Hostname"
                                    floatingLabelText="Hostname"
                                    type="text"
                                    errorText={this.state.hostname_error_text}
                                    onChange={(e) =>
                                        this.changeValue(e, "hostname")
                                    }
                                />
                            </div>
                            <div className="col-md-12">
                                <TextField
                                    hintText="Port"
                                    floatingLabelText="Port"
                                    type="number"
                                    onChange={(e) =>
                                        this.changeValue(e, "port")
                                    }
                                />
                            </div>
                            <div className="col-md-12">
                                <TextField
                                    hintText="Username"
                                    floatingLabelText="Username"
                                    type="text"
                                    onChange={(e) =>
                                        this.changeValue(e, "username")
                                    }
                                />
                            </div>
                            <div className="col-md-12">
                                <TextField
                                    hintText="Password"
                                    floatingLabelText="Password"
                                    type="password"
                                    onChange={(e) =>
                                        this.changeValue(e, "password")
                                    }
                                />
                            </div>
                            <div className="col-md-12">
                                <TextField
                                    hintText="Key Location"
                                    floatingLabelText="Key Location"
                                    type="text"
                                    onChange={(e) =>
                                        this.changeValue(e, "key_filename")
                                    }
                                />
                            </div>
                            <RaisedButton
                                disabled={this.state.disabled}
                                style={{ marginTop: 50 }}
                                label="Create Server"
                                onClick={(e) => this.create_server(e)}
                            />
                        </div>
                    </Paper>
                </div>
                <div>
                    <Paper style={style}>
                        <div className="text-center">
                            <h2>Check your servers!</h2>

                            <div className="col-md-12">
                                <TextField
                                    hintText="Hostname"
                                    floatingLabelText="Hostname"
                                    type="text"
                                    errorText={this.state.hostname_error_text}
                                    onChange={(e) =>
                                        this.changeValue(e, "hostname")
                                    }
                                />
                            </div>

                            <RaisedButton
                                disabled={this.state.disabled}
                                style={{ marginTop: 50 }}
                                label="Create Server"
                                onClick={(e) => this.create_server(e)}
                            />
                        </div>
                    </Paper>
                </div>
            </div>
        );
    }
}

ProtectedView.propTypes = {
    fetchProtectedData: React.PropTypes.func,
    loaded: React.PropTypes.bool,
    userName: React.PropTypes.string,
    data: React.PropTypes.any,
    token: React.PropTypes.string,
    createServer: React.PropTypes.func,
    createServerStatusText: React.PropTypes.string,
};

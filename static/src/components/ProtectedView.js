import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as actionCreators from "../actions/data";
import TextField from "material-ui/TextField";
import RaisedButton from "material-ui/RaisedButton";
import Paper from "material-ui/Paper";
import SelectField from "material-ui/SelectField";
import MenuItem from "material-ui/MenuItem";

import {
    get_detection_status,
    get_analytics_data,
} from "../utils/http_functions";
import Analytics from "./Analytics";

function mapStateToProps(state) {
    return {
        data: state.data.data,
        token: state.auth.token,
        loaded: state.data.loaded,
        isFetching: state.data.isFetching,
        createServerStatusText: state.data.createServerStatusText,
        usersServers: state.data.usersServers,
        currentServerCurrentStatus: state.data.currentServerCurrentStatus,
        currentDetectionStatuses: state.currentDetectionStatuses,
    };
}

function getStatusesContinuously(runningServers) {
    console.log("continious detection started...");
    var currentDetectionStatuses1 = {};

    runningServers.forEach((item) => {
        var hostnm = item.hostname;
        get_detection_status(hostnm).then((result) => {
            var status = result.data.status;
            currentDetectionStatuses1[hostnm] = status;
        });
    });

    return currentDetectionStatuses1;
}

function runThread(msg) {
    setInterval(function () {
        console.log(msg);
    }, 5000);
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

function getChartParams(analyticsData) {
    var labelColumns = [];
    for (var i = 0; i < analyticsData.user.length; i++) {
        var value = analyticsData.user[i][0];
        labelColumns.push(new Date(value).toLocaleString()); // can edit the time from here
    }
    console.log(labelColumns);
    var dataColumns = [];
    for (var i = 0; i < analyticsData.user.length; i++) {
        var value = analyticsData.user[i][1];
        dataColumns.push(value);
    }
    console.log(dataColumns);

    var data = {
        labels: labelColumns,
        datasets: [
            {
                label: "CPU History Analytics",
                fill: false,
                lineTension: 0.1,
                backgroundColor: "rgba(75,192,192,0.4)",
                borderColor: "rgba(75,192,192,1)",
                borderCapStyle: "butt",
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: "miter",
                pointBorderColor: "rgba(75,192,192,1)",
                pointBackgroundColor: "#fff",
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "rgba(75,192,192,1)",
                pointHoverBorderColor: "rgba(220,220,220,1)",
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: dataColumns,
            },
        ],
    };
    return data;
}

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
            usersServers: null,
            isCurrentServerSelected: false,
            currentServerIdx: 0,
            currentServerUsername: null,
            currentServerName: null,
            currentServerHostname: null,
            currentServerPort: null,
            currentServerCurrentStatus: null,
            currentServerIsDetecting: null,
            fetchServerData: false,
            monitoring: false,
            currentDetectionStatuses: null,
        };
    }

    componentDidMount() {
        this.fetchData();
    }

    fetchData() {
        const token = this.props.token;
        this.props.fetchProtectedData(token);
    }

    componentDidUpdate() {
        if (this.props.data && !this.state.fetchServerData) {
            const userID = this.props.data._id.$oid;
            this.props.fetchServerData(userID);
            this.setState({
                fetchServerData: true,
            });
        }
        if (this.props.usersServers.length > 0 && !this.state.monitoring) {
            console.log(this.props.usersServers);
            this.setState({
                monitoring: true,
            });

            setInterval(() => {
                var runningServers = this.props.usersServers.filter((obj) => {
                    return obj.isDetecting == "True";
                });

                var currentDetectionStatuses1 = getStatusesContinuously(
                    runningServers
                );
                this.setState({
                    currentDetectionStatuses: currentDetectionStatuses1,
                });
                console.log("manually getting status");
                this.props.getDetectionStatus(this.state.currentServerHostname);
            }, 5000);

            // var runningServers = this.props.usersServers.filter((obj) => {
            //     return obj.isDetecting == "True";
            // });

            // var currentDetectionStatuses1 = getStatusesContinuously(
            //     runningServers
            // );
            // this.setState({
            //     currentDetectionStatuses: currentDetectionStatuses1,
            // });
        }
    }

    createServerSelectData() {
        let serverNameList = this.props.usersServers.map((a) => a.serverName);
        const serverMenuList = serverNameList.map((serverName, idx) => {
            return <MenuItem key={idx} value={idx} primaryText={serverName} />;
        });
        return serverMenuList;
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

    detect_server(e) {
        e.preventDefault();
        console.log(this.state.userID);
        this.props.detectServer(
            this.props.data._id.$oid,
            this.state.currentServerHostname,
            this.state.currentServerPort,
            this.state.currentServerUsername,
            this.props.usersServers[this.state.currentServerIdx].password,
            this.props.usersServers[this.state.currentServerIdx].key_filename
        );
        this.setState({
            currentServerIsDetecting: "True",
        });
    }

    get_detection_status(e) {
        e.preventDefault();
        console.log("before gettins status");
        this.props.getDetectionStatus(this.state.currentServerHostname);
    }

    stop_detection(e) {
        e.preventDefault();
        console.log("Stop detection");
        this.props.stopServerDetect(this.state.currentServerHostname);
        this.setState({
            currentServerIsDetecting: "False",
        });
    }

    changeValue(e, type) {
        const value = e.target.value;
        const next_state = {};
        next_state[type] = value;
        this.setState(next_state, () => {
            this.isDisabled();
        });
    }

    handleChangeServerNames = (event, index, value) => {
        this.setState({
            currentServerIdx: value,
            isCurrentServerSelected: true,
            currentServerUsername: this.props.usersServers[value].username,
            currentServerName: this.props.usersServers[value].serverName,
            currentServerHostname: this.props.usersServers[value].hostname,
            currentServerPort: this.props.usersServers[value].port,
            currentServerIsDetecting: this.props.usersServers[value]
                .isDetecting,
        });

        get_analytics_data(
            this.props.usersServers[value].hostname,
            this.props.usersServers[value].port,
            this.props.usersServers[value].username,
            this.props.usersServers[value].password,
            this.props.usersServers[value].key_filename
        ).then((result) => {
            console.log(result);
            if (result.data.error) {
                this.setState({
                    analyticsParams: result.data,
                });
            } else {
                var status = result.data.analytics;
                var analyticsParams = getChartParams(status);
                this.setState({
                    analyticsParams: analyticsParams,
                });
            }
        });
    };

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
                        <div className="detection-area">
                            <h2 className="text-center">Detection Dashboard</h2>
                            <div className="col-md-12">
                                {!this.props.loaded ? (
                                    <h1>Loading data...</h1>
                                ) : (
                                    <SelectField
                                        hintText="Server name"
                                        value={this.state.currentServerIdx}
                                        floatingLabelText="Server Name"
                                        onChange={this.handleChangeServerNames}
                                        fullWidth={true}
                                    >
                                        {this.createServerSelectData()}
                                    </SelectField>
                                )}
                            </div>
                            {!this.state.isCurrentServerSelected ? (
                                <p style={{ paddingLeft: 15 }}>
                                    Select a server ...
                                </p>
                            ) : (
                                <div className="dynamic-data-area">
                                    <div className="dashboard-content">
                                        <div className="content-details">
                                            <div>
                                                <p>
                                                    <span className="label-data">
                                                        Username:{" "}
                                                    </span>
                                                    {
                                                        this.state
                                                            .currentServerUsername
                                                    }
                                                </p>
                                                <p>
                                                    <span className="label-data">
                                                        Hostname:{" "}
                                                    </span>
                                                    {
                                                        this.state
                                                            .currentServerHostname
                                                    }
                                                </p>
                                                <p>
                                                    <span className="label-data">
                                                        Port:{" "}
                                                    </span>
                                                    {
                                                        this.state
                                                            .currentServerPort
                                                    }
                                                </p>
                                                <RaisedButton
                                                    label="Start Detecting"
                                                    disabled={
                                                        this.state
                                                            .currentServerIsDetecting ==
                                                        "True"
                                                    }
                                                    primary={true}
                                                    style={{ marginTop: 20 }}
                                                    onClick={(e) =>
                                                        this.detect_server(e)
                                                    }
                                                />
                                                <br />
                                                <RaisedButton
                                                    label="Stop detection"
                                                    disabled={
                                                        this.state
                                                            .currentServerIsDetecting ==
                                                        "False"
                                                    }
                                                    primary={true}
                                                    className="priorityBtn"
                                                    style={{ marginTop: 20 }}
                                                    onClick={(e) =>
                                                        this.stop_detection(e)
                                                    }
                                                />
                                                <br />
                                                <br />
                                            </div>
                                        </div>

                                        <div className="content-status">
                                            <p>
                                                <span className="label-data">
                                                    Status:{" "}
                                                </span>
                                                {this.props
                                                    .currentServerCurrentStatus ==
                                                    null && (
                                                    <span>Loading ... </span>
                                                )}
                                                {this.props
                                                    .currentServerCurrentStatus ==
                                                    undefined && (
                                                    <span>Loading ... </span>
                                                )}
                                                {this.props
                                                    .currentServerCurrentStatus ==
                                                    "requesting" && (
                                                    <span>Requesting ... </span>
                                                )}
                                                {this.props
                                                    .currentServerCurrentStatus ==
                                                    "Server not running" && (
                                                    <span>
                                                        Server not running{" "}
                                                    </span>
                                                )}

                                                {this.props
                                                    .currentServerCurrentStatus ==
                                                    0 && <span>False </span>}
                                                {this.props
                                                    .currentServerCurrentStatus ==
                                                    1 && <span>True </span>}
                                            </p>
                                            <RaisedButton
                                                label="Get status"
                                                style={{ marginTop: 20 }}
                                                onClick={(e) =>
                                                    this.get_detection_status(e)
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="analytics-content">
                                        {this.state.analyticsParams ? (
                                            <Analytics
                                                {...this.state.analyticsParams}
                                                type="line"
                                            />
                                        ) : (
                                            <p>Loading ... </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Paper>
                </div>
            </div>
        );
    }
}

ProtectedView.propTypes = {
    fetchProtectedData: React.PropTypes.func,
    fetchServerData: React.PropTypes.func,
    loaded: React.PropTypes.bool,
    userName: React.PropTypes.string,
    data: React.PropTypes.any,
    token: React.PropTypes.string,
    createServer: React.PropTypes.func,
    detectServer: React.PropTypes.func,
    getDetectionStatus: React.PropTypes.func,
    getAnalyticsGraphData: React.PropTypes.func,
    stopServerDetect: React.PropTypes.func,
    createServerStatusText: React.PropTypes.string,
};

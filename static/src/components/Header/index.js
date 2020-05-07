import React, { Component } from "react";
import { browserHistory } from "react-router";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import AppBar from "material-ui/AppBar";
import LeftNav from "material-ui/Drawer";
import MenuItem from "material-ui/MenuItem";
import FlatButton from "material-ui/FlatButton";
import FontIcon from "material-ui/FontIcon";
import Divider from "material-ui/Divider";

import * as actionCreators from "../../actions/auth";

function mapStateToProps(state) {
    return {
        token: state.auth.token,
        userName: state.auth.userName,
        isAuthenticated: state.auth.isAuthenticated,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(actionCreators, dispatch);
}

const appbarStyle = {
    backgroundColor: "#2d364d",
};

@connect(mapStateToProps, mapDispatchToProps)
export class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
        };
    }

    dispatchNewRoute(route) {
        browserHistory.push(route);
        this.setState({
            open: false,
        });
    }

    handleClickOutside() {
        this.setState({
            open: false,
        });
    }

    logout(e) {
        e.preventDefault();
        this.props.logoutAndRedirect();
        this.setState({
            open: false,
        });
    }

    openNav() {
        this.setState({
            open: true,
        });
    }

    render() {
        return (
            <header>
                <LeftNav className="left-nav" open={this.state.open}>
                    {!this.props.isAuthenticated ? (
                        <div>
                            <MenuItem
                                onClick={() => this.dispatchNewRoute("/login")}
                            >
                                Login
                            </MenuItem>
                            <MenuItem
                                onClick={() =>
                                    this.dispatchNewRoute("/register")
                                }
                            >
                                Register
                            </MenuItem>
                        </div>
                    ) : (
                        <div>
                            <MenuItem
                                onClick={() => this.dispatchNewRoute("/main")}
                            >
                                Detection
                            </MenuItem>
                            <MenuItem
                                onClick={() =>
                                    this.dispatchNewRoute("/create-server")
                                }
                            >
                                Create Server
                            </MenuItem>
                            <Divider className="left-nav-div" />

                            <MenuItem
                                className="logout-btn"
                                onClick={(e) => this.logout(e)}
                            >
                                Logout
                            </MenuItem>
                        </div>
                    )}
                </LeftNav>
                <AppBar
                    title="Cryptojacking Attack Detection System"
                    style={appbarStyle}
                    className="app-bar"
                    onLeftIconButtonTouchTap={() => this.openNav()}
                    iconClassNameRight="crypto-icon"
                />
            </header>
        );
    }
}

Header.propTypes = {
    logoutAndRedirect: React.PropTypes.func,
    isAuthenticated: React.PropTypes.bool,
};

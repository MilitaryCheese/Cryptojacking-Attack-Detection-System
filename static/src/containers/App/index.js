import React from "react";

import getMuiTheme from "material-ui/styles/getMuiTheme";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";

/* application components */
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";

/* global styles for app */
import "./styles/app.scss";

class App extends React.Component {
    // eslint-disable-line react/prefer-stateless-function
    static propTypes = {
        children: React.PropTypes.node,
    };

    render() {
        return (
            <MuiThemeProvider muiTheme={getMuiTheme()}>
                <section>
                    <Header />
                    <div
                        className="container main-container"
                        style={{ paddingBottom: 550 }}
                    >
                        {this.props.children}
                    </div>
                    <div>
                        <Footer />
                    </div>
                </section>
            </MuiThemeProvider>
        );
    }
}

export { App };

import React from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import * as actionCreators from "../actions/auth";
import { Line } from "react-chartjs-2";

function mapStateToProps(state) {
    return {
        isRegistering: state.auth.isRegistering,
        registerStatusText: state.auth.registerStatusText,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(actionCreators, dispatch);
}

const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    datasets: [
        {
            label: "My First dataset",
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
            data: [65, 59, 80, 81, 56, 55, 40],
        },
    ],
};

var chartData = {};
var error = null;

@connect(mapStateToProps, mapDispatchToProps)
class Analytics extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            chartData: {},
        };
        error = false;
        if (this.props.error) {
            error = true;
            console.log("error: " + error);
        } else {
            chartData = {
                labels: this.props.labels,
                datasets: this.props.datasets,
            };
            error = false;
        }
    }

    componentDidUpdate() {
        if (this.props.error) {
            error = true;
            console.log("error: " + error);
        } else {
            chartData = {
                labels: this.props.labels,
                datasets: this.props.datasets,
            };
            error = false;
        }
        if (chartData.labels == this.state.chartData.labels) {
            //dont update
        } else {
            this.setState({
                chartData: chartData,
            });
            console.log("update");
        }
    }

    componentDidMount() {
        this.setState({
            chartData: chartData,
        });

        console.log(this.state.chartData);
    }

    render() {
        return (
            <div>
                <h1>Analytics</h1>
                <p>{error}</p>
                {this.props.error ? (
                    <p>{this.props.error}</p>
                ) : (
                    <Line data={this.state.chartData} />
                )}
            </div>
        );
    }
}

export default Analytics;

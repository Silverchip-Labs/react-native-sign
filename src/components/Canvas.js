import React from "react";
import { View, PanResponder, StyleSheet } from "react-native";
import Svg, { G, Path } from "react-native-svg";
import Reaction from "./Reaction";

export default class Canvas extends React.Component {
    static defaultProps = {
        throttleWait: 5,
        onStart: () => {},
        onEnd: () => {},
        donePaths: [],
        setDonePaths: () => {}
    };

    constructor(props, context) {
        super(props, context);
        this.state = {
            currentPoints: []
        };

        this._panResponder = PanResponder.create({
            onPanResponderTerminate: () => true,
            onPanResponderTerminationRequest: () => false,
            onStartShouldSetPanResponderCapture: () => true,
            onStartShouldSetPanResponder: (evt, gs) => true,
            onMoveShouldSetPanResponder: (evt, gs) => false,
            onPanResponderGrant: (evt, gs) => this.onResponderGrant(evt, gs),
            onPanResponderMove: (evt, gs) => this.onResponderMove(evt, gs),
            onPanResponderRelease: (evt, gs) => this.onResponderRelease(evt, gs)
        });

        this.canvas = React.createRef();
        this.reaction = new Reaction();
        this.lastMoved = Date.now();
        this.currentMax = 0;
    }

    onTouch(evt) {
        let [x, y] = [evt.nativeEvent.pageX, evt.nativeEvent.pageY];
        const { currentPoints } = this.state;

        this.setState({
            currentPoints: currentPoints.concat({ x, y })
        });
    }

    onResponderGrant(evt) {
        const canvas = this.canvas.current;

        this._measureComponent(canvas).then(({ px, py }) => {
            this.reaction.setOffset(px, py);
        });

        this.props.onStart();
        this.onTouch(evt);
    }

    onResponderMove(evt) {
        // throttle the requests to every 10ms
        const time = Date.now();
        const delta = time - this.lastMoved;
        if (delta < this.props.throttleWait) {
            return;
        }
        this.lastMoved = time;

        this.onTouch(evt);
    }

    onResponderRelease() {
        let newPaths = this.props.donePaths;
        const { currentPoints } = this.state;
        if (currentPoints.length) {
            // Cache the shape object so that we aren't testing
            // whether or not it changed; too many components?
            newPaths = newPaths.concat(
                <Path
                    key={this.currentMax}
                    d={this.reaction.pointsToSvg(currentPoints)}
                    stroke="black"
                    strokeWidth={3}
                    fill="none"
                />
            );
        }

        this.reaction.addGesture(currentPoints);
        this.currentMax += 1;
        this.setState({ currentPoints: [] });

        this.props.onEnd();
        this.props.setDonePaths(newPaths);
    }

    _measureComponent = comp => {
        return new Promise(resolve => {
            comp.measure((fx, fy, width, height, px, py) => {
                resolve({ fx, fy, width, height, px, py });
            });
        });
    };

    render() {
        return (
            <View ref={this.canvas} style={styles.drawContainer}>
                <View {...this._panResponder.panHandlers}>
                    <Svg style={styles.drawSurface} height={200}>
                        <G>
                            {this.props.donePaths}
                            <Path
                                key={this.currentMax}
                                d={this.reaction.pointsToSvg(
                                    this.state.currentPoints
                                )}
                                stroke="#4d4d4d"
                                strokeWidth={3}
                                strokeOpacity={0.5}
                                fill="none"
                            />
                        </G>
                    </Svg>
                </View>
            </View>
        );
    }
}

let styles = StyleSheet.create({
    drawContainer: {
        backgroundColor: "#FFF",
        borderWidth: 1,
        borderRadius: 2,
        borderColor: "#ddd",
        elevation: 1,
        height: 200
    },
    drawSurface: {
        backgroundColor: "transparent"
    }
});

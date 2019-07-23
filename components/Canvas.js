import React from "react";
import { View, PanResponder, StyleSheet } from "react-native";
import Svg, { G, Path } from "react-native-svg";
import Reaction from "paint/components/Reaction";

export default class Canvas extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            currentMax: 0,
            currentPoints: [],
            reaction: new Reaction()
        };

        this._panResponder = PanResponder.create({
            onPanResponderTerminate: () => true,
            onStartShouldSetPanResponder: (evt, gs) => true,
            onMoveShouldSetPanResponder: (evt, gs) => false,
            onPanResponderGrant: (evt, gs) => this.onResponderGrant(evt, gs),
            onPanResponderMove: (evt, gs) => this.onResponderMove(evt, gs),
            onPanResponderRelease: (evt, gs) => this.onResponderRelease(evt, gs)
        });
    }

    onTouch(evt) {
        let [x, y] = [evt.nativeEvent.pageX, evt.nativeEvent.pageY];
        const newCurrentPoints = this.state.currentPoints;
        newCurrentPoints.push({ x, y });

        this.setState({
            donePaths: this.props.donePaths,
            currentPoints: newCurrentPoints,
            currentMax: this.state.currentMax
        });
    }

    onResponderGrant(evt) {
        const { onStart = () => {} } = this.props;
        onStart();
        this.onTouch(evt);
    }

    onResponderMove(evt) {
        this.onTouch(evt);
    }

    onResponderRelease() {
        const { onEnd = () => {} } = this.props;
        onEnd();

        const newPaths = this.props.donePaths;
        if (this.state.currentPoints.length > 0) {
            // Cache the shape object so that we aren't testing
            // whether or not it changed; too many components?
            newPaths.push(
                <Path
                    key={this.state.currentMax}
                    d={this.state.reaction.pointsToSvg(
                        this.state.currentPoints
                    )}
                    stroke="black"
                    strokeWidth={3}
                    fill="none"
                />
            );
        }

        this.state.reaction.addGesture(this.state.currentPoints);

        this.setState({
            currentPoints: [],
            currentMax: this.state.currentMax + 1
        });

        this.props.setDonePaths(newPaths);
    }

    _onLayoutContainer = e => {
        this.state.reaction.setOffset(e.nativeEvent.layout);
    };

    render() {
        return (
            <View
                onLayout={this._onLayoutContainer}
                style={[
                    styles.drawContainer,
                    { width: this.props.width, height: this.props.height }
                ]}
            >
                <View {...this._panResponder.panHandlers}>
                    <Svg
                        style={styles.drawSurface}
                        width={this.props.width}
                        height={this.props.height}
                    >
                        <G>
                            {this.props.donePaths.map(p => p)}
                            <Path
                                key={this.state.currentMax}
                                d={this.state.reaction.pointsToSvg(
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
        borderBottomWidth: 0,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1
    },
    drawSurface: {
        backgroundColor: "transparent"
    }
});

import React from "react";
import { captureRef as takeSnapshotAsync } from "react-native-view-shot";

import Canvas from "./Canvas";

export default class SigPad extends React.Component {
    static defaultProps = {
        throttleWait: 5,
        onStart: () => {},
        onEnd: () => {},
        onChange: () => {}
    };

    constructor(props, context) {
        super(props, context);

        this.state = {
            results: [],
            strokeWidth: 4,
            donePaths: []
        };

        this.clear = this.clear.bind(this);
        this.undo = this.undo.bind(this);
    }

    clear = () => {
        this._setDonePaths([]);
    };

    undo = () => {
        this._setDonePaths(this.state.donePaths.slice(0, -1));
    };

    _handleChange = async () => {
        if (!this.state.donePaths.length) {
            return this.props.onChange("");
        }

        const base64 = await takeSnapshotAsync(this.canvas, {
            format: "png",
            result: "base64",
            quality: 0.2
        });
        this.props.onChange(base64);
    };

    _setDonePaths = async donePaths => {
        await this._setStateAsync({ donePaths });
        this._handleChange();
    };

    _setStateAsync = state => {
        return new Promise(resolve => {
            this.setState(state, resolve);
        });
    };

    render() {
        return (
            <Canvas
                ref={view => {
                    this.canvas = view;
                }}
                throttleWait={this.props.throttleWait}
                onStart={this.props.onStart}
                onEnd={this.props.onEnd}
                donePaths={this.state.donePaths}
                setDonePaths={this._setDonePaths}
            />
        );
    }
}

import React from "react";
import { captureRef as takeSnapshotAsync } from "react-native-view-shot";

import Canvas from "./Canvas";

export default class SigPad extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            results: [],
            strokeWidth: 4,
            donePaths: []
        };

        this.clear = this.clear.bind(this);
        this.undo = this.undo.bind(this);
        this.getValue = this.getValue.bind(this);
    }

    clear = () => {
        this.setState({ donePaths: [] });
    };

    undo = () => {
        this.setState({ donePaths: this.state.donePaths.slice(0, -1) });
    };

    getValue = async () => {
        if (!this.state.donePaths.length) {
            return "";
        }

        return await takeSnapshotAsync(this.canvas, {
            format: "png",
            result: "base64",
            quality: 1.0
        });
    };

    _setDonePaths = donePaths => {
        this.setState({ donePaths });
    };

    _handleStart = () => {
        const { onStart = () => {} } = this.props;
        onStart();
    };

    _handleEnd = () => {
        const { onEnd = () => {} } = this.props;
        onEnd();
    };

    render() {
        return (
            <Canvas
                ref={view => {
                    this.canvas = view;
                }}
                onStart={this._handleStart}
                onEnd={this._handleEnd}
                donePaths={this.state.donePaths}
                setDonePaths={this._setDonePaths}
            />
        );
    }
}

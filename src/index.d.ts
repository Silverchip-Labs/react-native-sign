import * as React from 'react';
import { Path } from 'react-native-svg';

// SigPad
declare interface ISigPadProps {
  throttleWait: number;
  onStart: () => void;
  onEnd: () => void;
  onChange: (string) => void;
}
declare class SigPad extends React.Component<ISigPadProps> {};

// Canvas
declare interface ICanvasProps {
  throttleWait: number;
  onStart: () => void;
  onEnd: () => void;
  donePaths: Path[]
}

declare class Canvas extends React.Component<ICanvasProps> {};

// Reaction doesn't need typedef

import type AudioContextType from "react-native-audio-api/lib/typescript/core/AudioContext";
// The package does not publish declarations for this asset-free deep runtime entry.
// @ts-expect-error react-native-audio-api exposes the runtime entry but not its declaration.
import AudioContextImplementation from "react-native-audio-api/lib/module/core/AudioContext";

const AudioContext = AudioContextImplementation as typeof AudioContextType;

export default AudioContext;

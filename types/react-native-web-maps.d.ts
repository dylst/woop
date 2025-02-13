// declare module '@teovilla/react-native-web-maps' {
//     import { ComponentType } from 'react';
//
//     // You can extend this interface with the actual props the component accepts.
//     export interface MapViewProps {
//         // Example: initialRegion?: { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number; };
//         [key: string]: any;
//     }
//
//     // Declare MapView as a valid React component.
//     const MapView: ComponentType<MapViewProps>;
//
//     export { MapView };
//     export default MapView;
//
//
// }

declare module "@teovilla/react-native-web-maps" {
	import * as React from "react";
	export class MapView extends React.Component<any, any> {}
}
 
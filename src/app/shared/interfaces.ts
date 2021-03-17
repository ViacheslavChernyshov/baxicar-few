export interface User {
  email: string;
}

export interface Route {
  id: number;
  routeId: number;
  userId: number;
  // routeTypeId: RouteType;
  startAddress: string;
  endAddress: string;
  originLatitude: number;
  originLongitude: number;
  destinationLatitude: number;
  destinationLongitude: number;
  // waypoints: List<WaypointDto>;

}

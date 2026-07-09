import { type MiniAppConfig } from "@/registry/types";
import WaypointScreen from "./Screen";

export const waypointApp: MiniAppConfig = {
  id: "waypoint",
  name: "Waypoint",
  description: "Marque um local e volte até ele com uma seta e a distância",
  category: "utilidades",
  icon: "MapPin",
  component: WaypointScreen,
  persistence: {
    enabled: true,
    storageKey: "waypoint-saved-points",
  },
};

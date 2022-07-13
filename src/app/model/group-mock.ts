import { GarageControlComponent } from "../components/home-controls/garage-control/garage-control.component";
import { Group } from "./group";

// export const groupMock01: Group = {
//   id: "mock-group",
//   name: "Wohnzimmer",
//   items: [
//     {
//       type: GroupItemType.TemperatureController,
//       data: {
//         id: "mock-temp",
//         tempCurrent: 26.222312312,
//         tempTarget: 21,
//         unit: TemperatureUnit.CELSIUS,
//         min: 18,
//         max: 38,
//       },
//     },
//     {
//       type: GroupItemType.Switch,
//       data: { id: "mock-light-01", name:"Hauptlicht", state: SwitchState.ON },
//     },
//     {
//       type: GroupItemType.Switch,
//       data: { id: "mock-light-02", name:"Stehlampe", state: SwitchState.ON },
//     },
//     {
//       type: GroupItemType.Switch,
//       data: { id: "mock-light-03", name:"Fernseherhintergrund", state: SwitchState.OFF },
//     },
//     {
//       type: GroupItemType.TemperatureController,
//       data: {
//         id: "mock-temp-2",
//         tempCurrent: -13,
//         tempTarget: 10,
//         unit: TemperatureUnit.CELSIUS,
//         min: -20,
//         max: 3,
//       },
//     },
//     {
//       type: GroupItemType.Switch,
//       data: { id: "mock-light-03", name:"Leselampe", state: SwitchState.ON },
//     },
//   ]
// }
// export const groupMock02: Group = {
//   id: "mock-group-02",
//   name: "Küche",
//   items: [
//     {
//       type: GroupItemType.TemperatureController,
//       data: {
//         id: "mock-temp",
//         tempCurrent: 23.222312312,
//         tempTarget: 16,
//         unit: TemperatureUnit.CELSIUS,
//         min: 16,
//         max: 38,
//       },
//     },
//     {
//       type: GroupItemType.Switch,
//       data: { id: "mock-light-04", name:"Hauptlicht", state: SwitchState.ON },
//     },
//     {
//       type: GroupItemType.Switch,
//       data: { id: "mock-light-05", name:"Unterleuchten", state: SwitchState.ON },
//     },
//     {
//       type: GroupItemType.Switch,
//       data: { id: "mock-light-06", name:"Ambiente", state: SwitchState.OFF },
//     },
//   ]
// }
export const groupMock03: Group = {
  id: "mock-group-03",
  name: "Garage",
  homeControlType: GarageControlComponent,
  config: {
    name: "123",
  },
}
export const groupsMock: Group[] = [
  //groupMock01,
  //groupMock02,
  groupMock03,
];
# @lukesthl/fritzbox

[![npm package][npm-img]][npm-url]
[![Build Status][build-img]][build-url]
[![Downloads][downloads-img]][downloads-url]
[![Issues][issues-img]][issues-url]
[![Code Coverage][codecov-img]][codecov-url]
[![Commitizen Friendly][commitizen-img]][commitizen-url]
[![Semantic Release][semantic-release-img]][semantic-release-url]

> A library for accessing a AVM Fritz!Box via TR-064 and HTTP API.

## Features

- Supports the command language of the [TR-064 API](https://avm.de/fileadmin/user_upload/Global/Service/Schnittstellen/AVM_TR-064_overview.pdf) of a Fritz!Box (partially typed with interfaces)
- Supports the [SmartHome HTTP API](https://avm.de/fileadmin/user_upload/Global/Service/Schnittstellen/AHA-HTTP-Interface.pdf)
- Typesafe commands: [`DeviceInfo`](#DeviceInfo), [`DeviceLog`](#DeviceInfo), [`LanDeviceHosts`](#LanDeviceHosts), [`SID`](#DeviceConfig), [`Reboot`](DeviceConfig), [`SmartHome Devices/Groups`](#home-automation), [`SmartHome DeviceStats`](#home-automation), [`EcoStats`](#unofficial-api), [`NetworkStats`](#unofficial-api)
- SSL encryption and authentication
- async/await promises
- generic support
- [Custom TR-064 Commands](#custom-tr-064-commands)

## Install

```bash
npm install @lukesthl/fritzbox
```

## Usage

```ts
import { FritzBox } from '@lukesthl/fritzbox';

const fritzbox = new FritzBox({
  username: FRITZBOX_USERNAME,
  password: FRITZBOX_PASSWORD,
});

const deviceInfo = await fritzbox.deviceInfo.getInfo();

console.log(deviceInfo.NewHardwareVersion); // FRITZ!Box 7590 (UI)
```

## API

### FritzBox

#### username

Type: `string`

#### password

Type: `string`

##### host (optional, default = fritz.box)

Type: `string`

##### port (optional, default = 49000)

Type: `number`

##### ssl (optional, default = false)

Type: `boolean`

##### tr064 (optional, default = true)

Type: `boolean`

### DeviceInfo

[Official Doc](https://avm.de/fileadmin/user_upload/Global/Service/Schnittstellen/deviceinfoSCPD.pdf)

Router Information, Device Logs, TR-069 Provisioning Code, Security Port

```ts
const deviceInfo = await fritzbox.deviceInfo.getInfo();

const deviceLog = await fritzbox.deviceInfo.getDeviceLog();

const securityPort = await fritzbox.deviceInfo.getSecurityPort();

await fritzbox.deviceInfo.setProvisioningCode({
  NewProvisioningCode: '123',
});
```

### LanDeviceHosts

[Official Doc](https://avm.de/fileadmin/user_upload/Global/Service/Schnittstellen/hostsSCPD.pdf)

Network Devices

```ts
const hostListPath = await fritzbox.lanDeviceHosts.getHostListPath();

const hosts = await fritzbox.lanDeviceHosts.getHosts();
// Host {
//   mac: string;
//   ip: string;
//   active: boolean;
//   name: string;
//   interface: string;
// }[]
```

### DeviceConfig

[Official Doc](https://avm.de/fileadmin/user_upload/Global/Service/Schnittstellen/deviceconfigSCPD.pdf)

Get SID, Reboot

```ts
// for cached Sid use fritzbox.getSid();
const urlSidResponse = await fritzbox.deviceConfig.getUrlSID();

await fritzbox.deviceConfig.reboot();
```

### Custom TR-064 Commands

```ts
const response = await fritzBox.exec<MyInterface>({
  serviceId: 'urn:DeviceConfig-com:serviceId:DeviceConfig1',
  actionName: 'Reboot',
});
```

### Home Automation

[Official Doc](https://avm.de/fileadmin/user_upload/Global/Service/Schnittstellen/AHA-HTTP-Interface.pdf)

SmartHome Devices / Stats

```ts
const { devices, deviceGroups } = await fritzBox.smartHome.getDevices();

const deviceStats =
  await fritzBox.homeautomation.deviceStats.getBasicDeviceStats(
    devices.at(0).ain
  );
```

### Unofficial API

Current Network Stats (past 100 sec.), Eco Stats (CPU-Usage, CPU-Temp, RAM)
Use at your own risk.

```ts
const networkStats = await fritzBox.unofficial.networkMonitor.getNetworkStats();

const [firstSyncGroup] = networkStats?.data.sync_groups || [];
let currentNetworkTraffic: NetworkTraffic[] | null = null;
if (firstSyncGroup) {
  currentNetworkTraffic =
    fritzBox.unofficial.networkMonitor.getNetworkTrafficBySyncGroup(
      firstSyncGroup
    );
}
// interface NetworkTraffic {
//     downBytes: number;
//     uploadDefaultBytes: number;
//     uploadImportantBytes: number;
//     uploadRealtimeBytes: number;
//     date: Date;
// }

const ecoStats = await fritzBox.unofficial.ecoStat.getEcoStat();
```

## AVM Documentation

- [API Informations](https://avm.de/service/schnittstellen/)
- [TR-064 Overview](https://avm.de/fileadmin/user_upload/Global/Service/Schnittstellen/AVM_TR-064_overview.pdf)

## Special Thanks

This is an fork of [@seydx's](https://github.com/seydx/fritzbox) package

[build-img]: https://github.com/lukesthl/ts-axios-digest-auth/actions/workflows/release.yml/badge.svg
[build-url]: https://github.com/lukesthl/ts-axios-digest-auth/actions/workflows/release.yml
[downloads-img]: https://img.shields.io/npm/dt/@lukesthl/ts-axios-digest-auth
[downloads-url]: https://www.npmtrends.com/@lukesthl/ts-axios-digest-auth
[npm-img]: https://img.shields.io/npm/v/@lukesthl/ts-axios-digest-auth
[npm-url]: https://www.npmjs.com/package/@lukesthl/ts-axios-digest-auth
[issues-img]: https://img.shields.io/github/issues/lukesthl/ts-axios-digest-auth
[issues-url]: https://github.com/lukesthl/ts-axios-digest-auth/issues
[codecov-img]: https://codecov.io/gh/lukesthl/ts-axios-digest-auth/branch/main/graph/badge.svg
[codecov-url]: https://codecov.io/gh/lukesthl/ts-axios-digest-auth
[semantic-release-img]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]: https://github.com/semantic-release/semantic-release
[commitizen-img]: https://img.shields.io/badge/commitizen-friendly-brightgreen.svg
[commitizen-url]: http://commitizen.github.io/cz-cli/

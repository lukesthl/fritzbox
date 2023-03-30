import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/services/deviceinfo.ts',
    'src/services/landdevicehosts.ts',
    'src/services/homeautomation/smarthome.ts',
    'src/services/speedtest.ts',
    'src/services/unofficial/ecostat.ts',
    'src/services/unofficial/networkmonitor.ts',
    'src/services/homeautomation/devicestats.ts',
  ],
  dts: true,
  legacyOutput: true,
  minify: true,
  clean: true,
  // esbuildOptions(options, context) {
  //   options.outbase = './';
  // },
});

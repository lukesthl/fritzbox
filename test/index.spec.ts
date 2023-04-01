import { FritzBox } from '../src';

const PASSWORD = '';
const USERNAME = '';

describe('index', () => {
  describe('FritzBox', () => {
    it('should throw error', async () => {
      const fritzBox = new FritzBox({ username: USERNAME, password: PASSWORD });
      const getInfo = async () => {
        await fritzBox.deviceInfo.getInfo();
      };
      await expect(getInfo).rejects.toThrow();
    });
  });
});

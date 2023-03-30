import { AxiosDigestAuth } from '../src';

const PASSWORD = '';
const USERNAME = '';

interface IPost {
  userId: number;
  id: number;
  title: string;
  body: string;
}

describe('index', () => {
  describe('AxiosDigestAuth', () => {
    it('should return response', async () => {
      const digestAuth = new AxiosDigestAuth({
        password: PASSWORD,
        username: USERNAME,
      });
      const response = await digestAuth.get<IPost[]>(
        'https://jsonplaceholder.typicode.com/posts'
      );

      expect(response.status).toBe(200);
      expect(response.data.length).toBeGreaterThan(0);
      expect(response.data[0].id).toBeDefined();
    });
  });
});

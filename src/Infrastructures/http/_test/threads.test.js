const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  let server;
  let accessToken;
  let refreshToken;

  afterAll(async () => {
    await pool.end();
  });

  beforeEach(async () => {
    server = await createServer(container);
    const fakeUserPayload = {
      username: 'dicoding',
      password: 'secret',
      fullname: 'Dicoding Indonesia',
    };
    await server.inject({
      method: 'POST',
      url: '/users',
      payload: fakeUserPayload,
    });
    const login = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username: fakeUserPayload.username,
        password: fakeUserPayload.password,
      },
    });
    const loginResponse = JSON.parse(login.payload);
    accessToken = loginResponse.data.accessToken;
    refreshToken = loginResponse.data.refreshToken;
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should respones 201 and persisted thread', async () => {
      // Arrange
      const requestPayload = {
        title: 'Sunset',
        body: 'Beautiful day for enjoy',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
    });
  });
  describe('when GET /threads/{threadId}', () => {
    it('should respones 200 and return detail thread and its comments', async () => {
      // Arrange
      const getThreadId = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'Sunset',
          body: 'Beautiful day for enjoy',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      const threadId = JSON.parse(getThreadId.payload).data.addedThread.id;

      await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'Comment Testing',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.comments).toBeDefined();
    });
    it('should response 404 when threadId not found', async () => {
      // Arrange dan Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/xxxx`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });
  });
});

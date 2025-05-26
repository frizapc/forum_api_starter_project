const pool = require('../../database/postgres/pool');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/comments endpoint', () => {
  let server;
  let accessToken;
  let refreshToken;
  let threadId;

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

    const thread = await server.inject({
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
    const threadResponse = JSON.parse(thread.payload);
    threadId = threadResponse.data.addedThread.id;
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should respons 201 and persisted comment', async () => {
      // Arrange
      const requestPayload = {
        content: 'This is my comment',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
    });
    it('should respons 404 when threadId not found', async () => {
      // Arrange
      const requestPayload = {
        content: 'This is my comment',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/xxxx/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread tidak ditemukan');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId} endpoint', () => {    
    it('should response 200 and delete the comment', async () => {
      // Arrange 
      const getCommentId = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: { content: 'This is my comment' },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const commentId = JSON.parse(getCommentId.payload).data.addedComment.id;

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 404 when threadId not found', async () => {
      // Arrange
      const getCommentId = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: { content: 'This is my comment' },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const commentId = JSON.parse(getCommentId.payload).data.addedComment.id;
      
      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/blabla/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread tidak ditemukan');
    });

    it('should response 404 when commentId not found', async () => {
      // Arrange
      const getCommentId = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: { content: 'This is my comment' },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const commentId = JSON.parse(getCommentId.payload).data.addedComment.id;
      
      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/xxxx`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Comment tidak ditemukan');
    });

    it('should response 401 when unidentified comment owner', async () => {
      // Arrange
      const fakeUserPayload = {
        username: 'newdicoding',
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
      const newAccessToken = loginResponse.data.accessToken;

      const getCommentId = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: { content: 'This is my comment' },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const commentId = JSON.parse(getCommentId.payload).data.addedComment.id;

      //  Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${newAccessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Unauthorized');
    });
  });
});

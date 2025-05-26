const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist new thread and return added thread correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'fakeuser123',
        password: 'secret_password',
        fullname: 'fake user',
      });
      const fakeuser = await UsersTableTestHelper.findUserById('user-123');
      const newThread = new NewThread({
        title: 'Sunset',
        body: 'Beautiful day for enjoy',
        owner: fakeuser[0].id,
      });
      const fakeIdGenerator = () => '123';

      /** create repository postgres instance */
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(newThread);
      const thread = await ThreadsTableTestHelper.findThreadById('thread-123');

      // Assert
      expect(thread).toHaveLength(1);
      expect(addedThread).toStrictEqual(
        new AddedThread({
          id: 'thread-123',
          title: 'Sunset',
          owner: 'user-123',
        })
      );
    });
  });

  describe('findThreadById function', () => {
    it('should return thread data correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'fakeuser123',
        password: 'secret_password',
        fullname: 'fake user',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'Sunset',
        body: 'Beautiful day for enjoy',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';

      /** create repository postgres instance */
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action and Assert
      const thread = await threadRepositoryPostgres.findThreadById(
        'thread-123'
      );
      expect(thread.id).toEqual('thread-123');
      expect(thread.title).toEqual('Sunset');
      expect(thread.body).toEqual('Beautiful day for enjoy');
      expect(thread.date).toBeDefined();
      expect(new Date(thread.date)).toBeInstanceOf(Date);
      expect(thread.username).toEqual('fakeuser123');
    });
    it('should throw an error thread not found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'fakeuser123',
        password: 'secret_password',
        fullname: 'fake user',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'Sunset',
        body: 'Beautiful day for enjoy',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';

      /** create repository postgres instance */
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action and Assert
      await expect(
        threadRepositoryPostgres.findThreadById('thread-1234')
      ).rejects.toThrowError('Thread tidak ditemukan');
    });
  });

  describe('verifyThreadById', () => {
    it('should verify thread correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'fakeuser123',
        password: 'secret_password',
        fullname: 'fake user',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'Sunset',
        body: 'Beautiful day for enjoy',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';

      /** create repository postgres instance */
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action and Assert
      await expect(
        threadRepositoryPostgres.verifyThreadById('thread-123')
      ).resolves.not.toThrowError(NotFoundError);
    });

    it('should throw error threadId not found', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';

      /** create repository postgres instance */
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action and Assert
      await expect(
        threadRepositoryPostgres.verifyThreadById('thread-1234')
      ).rejects.toThrowError('Thread tidak ditemukan');
    });
  });
});

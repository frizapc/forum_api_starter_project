const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommentsRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist new comment and return added comment correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'fakeuser123',
        password: 'secret_password',
        fullname: 'fake user',
      });
      const fakeuser = await UsersTableTestHelper.findUserById('user-123');
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'Sunset',
        body: 'Beautiful day for enjoy',
        owner: fakeuser[0].id,
      });
      const fakethread = await ThreadsTableTestHelper.findThreadById(
        'thread-123'
      );
      const newComment = new NewComment({
        content: 'This is my comment',
        userId: fakeuser[0].id,
        threadId: fakethread[0].id,
      });
      const fakeIdGenerator = () => '123';

      /** create repository postgres instance */
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(
        newComment
      );

      // Assert
      const comment = await CommentsTableTestHelper.findCommentById(
        'comment-123'
      );
      expect(comment).toHaveLength(1);
      expect(addedComment).toStrictEqual(
        new AddedComment({
          id: 'comment-123',
          content: 'This is my comment',
          owner: 'user-123',
        })
      );
    });
  });

  describe('deleteCommentById function', () => {
    it('should delete comment correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'fakeuser123',
        password: 'secret_password',
        fullname: 'fake user',
      });
      await UsersTableTestHelper.addUser({
        id: 'user-321',
        username: 'fakeuser321',
        password: 'secret_password',
        fullname: 'fake user',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'Sunset',
        body: 'Beautiful day for enjoy',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-321',
        content: 'This is my comment',
        owner: 'user-321',
        thread: 'thread-123',
      });

      /** create repository postgres instance */
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action and Assert
      await expect(
        commentRepositoryPostgres.deleteCommentById('comment-321')
      ).resolves.not.toThrowError(NotFoundError);

      const comment = await CommentsTableTestHelper.findCommentById(
        'comment-321'
      );
      expect(comment).toHaveLength(1);
      expect(comment[0].is_delete).toEqual(true);
    });

    it('should throw error when commentID not found', async () => {
      // Arrange
      /** create repository postgres instance */
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action and Assert
      await expect(
        commentRepositoryPostgres.deleteCommentById('unknown')
      ).rejects.toThrowError('Comment tidak ditemukan');
    });
  });

  describe('verifyCommentById', () => {
    it('should verify comment correctly', async () => {
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
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'This is my comment',
        owner: 'user-123',
        thread: 'thread-123',
      });
      const fakeIdGenerator = () => '123';

      /** create repository postgres instance */
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action and Assert
      await expect(
        commentRepositoryPostgres.verifyCommentById('comment-123')
      ).resolves.not.toThrowError(NotFoundError);
    });

    it('should throw error commentId not found', async () => {
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
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'This is my comment',
        owner: 'user-123',
        thread: 'thread-123',
      });
      const fakeIdGenerator = () => '123';

      /** create repository postgres instance */
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action and Assert
      await expect(
        commentRepositoryPostgres.verifyCommentById('comment-1234')
      ).rejects.toThrowError('Comment tidak ditemukan');
    });
  });

  describe('checkCommentOwner', () => {
    it('should identify comment owner correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'fakeuser123',
        password: 'secret_password',
        fullname: 'fake user',
      });
      await UsersTableTestHelper.addUser({
        id: 'user-321',
        username: 'fakeuser321',
        password: 'secret_password',
        fullname: 'fake user',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'Sunset',
        body: 'Beautiful day for enjoy',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-321',
        content: 'This is my comment',
        owner: 'user-321',
        thread: 'thread-123',
      });

      /** create repository postgres instance */
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action and Assert
      await expect(
        commentRepositoryPostgres.checkCommentOwner({
          commentId: 'comment-321',
          userId: 'user-321',
        })
      ).resolves.not.toThrowError(AuthorizationError);
    });

    it('should throw error when owner unidentified', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'fakeuser123',
        password: 'secret_password',
        fullname: 'fake user',
      });
      await UsersTableTestHelper.addUser({
        id: 'user-321',
        username: 'fakeuser321',
        password: 'secret_password',
        fullname: 'fake user',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'Sunset',
        body: 'Beautiful day for enjoy',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-321',
        content: 'This is my comment',
        owner: 'user-321',
        thread: 'thread-123',
      });

      /** create repository postgres instance */
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action and Assert
      await expect(
        commentRepositoryPostgres.checkCommentOwner({
          commentId: 'comment-321',
          userId: 'user-123',
        })
      ).rejects.toThrowError('Unauthorized');
    });
  });

  describe('findCommentsByThreadId function', () => {
    it('should return thread with its comments correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'fakeuser123',
        password: 'secret_password',
        fullname: 'fake user',
      });
      await UsersTableTestHelper.addUser({
        id: 'user-321',
        username: 'fakeuser321',
        password: 'secret_password',
        fullname: 'fake user',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'Sunset',
        body: 'Beautiful day for enjoy',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-321',
        content: 'This is my comment',
        owner: 'user-321',
        thread: 'thread-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'Have a good day',
        owner: 'user-123',
        thread: 'thread-123',
      });

      // Action
      /** create repository postgres instance */
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const comments = await commentRepositoryPostgres.findCommentsByThreadId(
        'thread-123'
      );

      // Assert
      expect(comments).toHaveLength(2);
      
      expect(comments[0].id).toEqual('comment-321');
      expect(comments[0].content).toEqual('This is my comment');
      expect(new Date(comments[0].date)).toBeInstanceOf(Date);
      expect(comments[0].username).toEqual('fakeuser321');
      expect(comments[0].is_delete).toEqual(false);
      
      expect(comments[1].id).toEqual('comment-123');
      expect(comments[1].content).toEqual('Have a good day');
      expect(new Date(comments[1].date)).toBeInstanceOf(Date);
      expect(comments[1].username).toEqual('fakeuser123');
      expect(comments[1].is_delete).toEqual(false);
    });
  });
});

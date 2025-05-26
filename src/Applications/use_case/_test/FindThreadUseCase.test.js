const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const FindThreadUseCase = require('../FindThreadUseCase');
const ThreadComments = require('../../../Domains/threads/entities/ThreadComments');

describe('FindThreadUseCase', () => {
  it('should orchestrating the find thread action correctly', async () => {
    // Arramge
    const useCasePayload = 'thread-123';

    const mockFindThreadByid = {
      id: 'thread-h_2FkLZhtgBKY2kh4CC02',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: new Date('2021-08-08T07:19:09.775Z'),
      username: 'dicoding',
    };

    const mockFindCommentsByThreadId = [
      {
        id: 'comment-_pby2_tmXV6bcvcdev8xk',
        username: 'johndoe',
        date: new Date('2021-08-08T07:22:33.555Z'),
        content: 'sebuah comment',
        is_delete: false,
      },
      {
        id: 'comment-yksuCoxM2s4MMrZJO-qVD',
        username: 'dicoding',
        date: new Date('2021-08-08T07:26:21.338Z'),
        content: 'sebuah comment',
        is_delete: true,
      },
    ];

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.findThreadById = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockFindThreadByid));
    mockCommentRepository.findCommentsByThreadId = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockFindCommentsByThreadId));

    /** creating use case instance */
    const getThreadUseCase = new FindThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const findThread = await getThreadUseCase.execute(useCasePayload);

    // Assert
    expect(findThread).toStrictEqual({
      id: 'thread-h_2FkLZhtgBKY2kh4CC02',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: new Date('2021-08-08T07:19:09.775Z'),
      username: 'dicoding',
      comments: [
        new ThreadComments({
          id: 'comment-_pby2_tmXV6bcvcdev8xk',
          username: 'johndoe',
          date: new Date('2021-08-08T07:22:33.555Z'),
          content: 'sebuah comment',
          is_delete: false,
        }),
        new ThreadComments({
          id: 'comment-yksuCoxM2s4MMrZJO-qVD',
          username: 'dicoding',
          date: new Date('2021-08-08T07:26:21.338Z'),
          content: '**komentar telah dihapus**',
          is_delete: false,
        }),
      ],
    });
    expect(mockThreadRepository.findThreadById).toBeCalledWith(useCasePayload);
    expect(mockCommentRepository.findCommentsByThreadId).toBeCalledWith(
      useCasePayload
    );
  });
});

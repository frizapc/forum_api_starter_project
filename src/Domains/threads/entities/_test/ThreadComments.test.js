const ThreadComments = require('../ThreadComments');

describe('a ThreadComments entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'comment-_pby2_tmXV6bcvcdev8xk',
      username: 'johndoe',
      date: new Date('2021-08-08T07:22:33.555Z'),
      content: 'sebuah comment',
    };

    // Action and Assert
    expect(() => new ThreadComments(payload)).toThrowError(
      'THREAD_COMMENTS.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'comment-_pby2_tmXV6bcvcdev8xk',
      username: 'johndoe',
      date: new Date('2021-08-08T07:22:33.555Z'),
      content: 'sebuah comment',
      is_delete: 'true',
    };

    // Action and Assert
    expect(() => new ThreadComments(payload)).toThrowError(
      'THREAD_COMMENTS.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should create ThreadComments object with pure content correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-yksuCoxM2s4MMrZJO-qVD',
      username: 'dicoding',
      date: new Date('2021-08-08T07:26:21.338Z'),
      content: 'this is my comment',
      is_delete: false,
    };

    // Action
    const threadComments = new ThreadComments(payload);

    // Assert
    expect(threadComments.id).toEqual(payload.id);
    expect(threadComments.username).toEqual(payload.username);
    expect(threadComments.date).toEqual(payload.date);
    expect(threadComments.content).toEqual(payload.content);
  });

  it('should create ThreadComments object with deleted content', () => {
    // Arrange
    const payload = {
      id: 'comment-yksuCoxM2s4MMrZJO-qVD',
      username: 'dicoding',
      date: new Date('2021-08-08T07:26:21.338Z'),
      content: 'this is my comment',
      is_delete: true,
    };

    // Action
    const threadComments = new ThreadComments(payload);

    // Assert
    expect(threadComments.id).toEqual(payload.id);
    expect(threadComments.username).toEqual(payload.username);
    expect(threadComments.date).toEqual(payload.date);
    expect(threadComments.content).toEqual('**komentar telah dihapus**');
  });
});

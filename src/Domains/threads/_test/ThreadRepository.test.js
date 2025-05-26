const ThreadRepository = require("../ThreadRepository")

describe('ThreadRepository interface', () => {
  it('should throw error when invoked abstrak behavior', async () => {
    // Arrange
    const threadRepository = new ThreadRepository();

    // Action and Assert
    await expect(threadRepository.addThread({})).rejects.toThrowError(
      'THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTES'
    );
    await expect(
      threadRepository.findThreadById('threadId')
    ).rejects.toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTES');
    await expect(
      threadRepository.verifyThreadById('threadId')
    ).rejects.toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTES');
  })
})
const ThreadComments = require('../../Domains/threads/entities/ThreadComments');

class FindThreadUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const thread = await this._threadRepository.findThreadById(useCasePayload);
    const comments = await this._commentRepository.findCommentsByThreadId(
      useCasePayload,
    );

    thread.comments = [];
    comments.forEach((comment) => {
      thread.comments.push(new ThreadComments(comment));
    });

    return thread;
  }
}

module.exports = FindThreadUseCase;

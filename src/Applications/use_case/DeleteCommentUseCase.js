class DeleteCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    await this._threadRepository.verifyThreadById(useCasePayload.threadId);
    await this._commentRepository.verifyCommentById(useCasePayload.commentId);
    await this._commentRepository.checkCommentOwner({
      commentId: useCasePayload.commentId,
      userId: useCasePayload.userId,
    });
    await this._commentRepository.deleteCommentById(useCasePayload.commentId);
  }
}

module.exports = DeleteCommentUseCase;

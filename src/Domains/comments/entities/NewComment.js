class NewComment {
  constructor(payload) {
    this._verifyPayload(payload);

    const { content, userId, threadId } = payload;

    this.content = content;
    this.userId = userId;
    this.threadId = threadId;
  }

  _verifyPayload({ content, userId, threadId }) {
    if (!content || !userId || !threadId) {
      throw new Error('NEW_COMMENT.NOT_CONTAIN_NEEDED PROPRTY');
    }

    if (
      typeof content !== 'string'
      || typeof userId !== 'string'
      || typeof threadId !== 'string'
    ) {
      throw new Error('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = NewComment;

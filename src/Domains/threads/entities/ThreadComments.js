class ThreadComments {
  constructor(payload) {
    this._verifyPayload(payload);

    this.id = payload.id;
    this.username = payload.username;
    this.date = payload.date;
    this.content = payload.is_delete
      ? '**komentar telah dihapus**'
      : payload.content;
  }

  _verifyPayload(payload) {
    const {
      id, username, date, content, is_delete: isDelete,
    } = payload;
    if (
      !id
      || !username
      || !date
      || !content
      || (!isDelete && isDelete !== false)
    ) {
      throw new Error('THREAD_COMMENTS.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string'
      || typeof username !== 'string'
      || !(date instanceof Date)
      || typeof content !== 'string'
      || typeof isDelete !== 'boolean'
    ) {
      throw new Error('THREAD_COMMENTS.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = ThreadComments;

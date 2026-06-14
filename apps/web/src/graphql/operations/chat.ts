const CHAT_USER_FIELDS = `
  id
  displayName
  displayRole
  roleLabel
  avatarUrl
  initials
`;

export const CHAT_CONTACTS = `
  query ChatContacts {
    chatContacts {
      ${CHAT_USER_FIELDS}
    }
  }
`;

const CHAT_CONVERSATION_FIELDS = `
      id
      type
      title
      lastMessage
      lastMessageAt
      unreadCount
      updatedAt
      peer {
        ${CHAT_USER_FIELDS}
      }
      participants {
        ${CHAT_USER_FIELDS}
      }
`;

export const CHAT_INBOX = `
  query ChatInbox {
    chatInbox {
${CHAT_CONVERSATION_FIELDS}
    }
  }
`;

export const CHAT_INBOX_PAGE = `
  query ChatInboxPage($cursor: String, $limit: Int) {
    chatInboxPage(cursor: $cursor, limit: $limit) {
      hasMore
      nextCursor
      items {
${CHAT_CONVERSATION_FIELDS}
      }
    }
  }
`;

export const CHAT_MESSAGES = `
  query ChatMessages($conversationId: ID!, $cursor: String) {
    chatMessages(conversationId: $conversationId, cursor: $cursor) {
      id
      conversationId
      senderId
      body
      createdAt
      isMine
      attachment {
        id
        fileName
        mimeType
        sizeBytes
        url
        expiresAt
        expired
      }
      sender {
        ${CHAT_USER_FIELDS}
      }
    }
  }
`;

export const FIND_OR_CREATE_DIRECT = `
  mutation FindOrCreateDirectConversation($peerUserId: ID!) {
    findOrCreateDirectConversation(peerUserId: $peerUserId) {
      id
      type
      title
      lastMessage
      lastMessageAt
      unreadCount
      updatedAt
      peer {
        ${CHAT_USER_FIELDS}
      }
    }
  }
`;

export const CREATE_GROUP_CONVERSATION = `
  mutation CreateGroupConversation($input: CreateGroupConversationInput!) {
    createGroupConversation(input: $input) {
      id
      type
      title
      lastMessage
      lastMessageAt
      unreadCount
      updatedAt
      participants {
        ${CHAT_USER_FIELDS}
      }
    }
  }
`;

export const MARK_CONVERSATION_READ = `
  mutation MarkConversationRead($conversationId: ID!) {
    markConversationRead(conversationId: $conversationId) {
      ok
    }
  }
`;

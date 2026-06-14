export const WORD_OF_DAY = `
  query WordOfDay {
    wordOfDay {
      wordId
      cardId
      text
      phonetic
      partOfSpeech
      definition
      example
    }
  }
`;

export const VOCABULARY_OVERVIEW = `
  query VocabularyOverview {
    vocabularyOverview {
      totalWords
      masteredWords
      dueToday
    }
  }
`;

const WORD_CARD_FIELDS = `
  id
  text
  definition
  definitions { languageId text lemmaText partOfSpeech }
  example
  phonetic
  partOfSpeech
  category
  audioUrl
  origin
  synonyms
  antonyms
  source
`;

/** Timestamps required for statistics (added vs known trends). */
const STUDENT_WORD_CARD_FIELDS = `
  id
  status
  masteryLevel
  lessonId
  firstSeenAt
  knownAt
`;

export const LOOKUP_WORD = `
  query LookupWord($text: String!) {
    lookupWord(text: $text) {
      foundInDb
      foundInDictionary
      word { ${WORD_CARD_FIELDS} }
      preview { ${WORD_CARD_FIELDS} }
    }
  }
`;

export const WORD_DETAILS = `
  query WordDetails($id: ID!) {
    wordDetails(id: $id) {
      ${WORD_CARD_FIELDS}
      sourcePayloadJson
    }
  }
`;

export const LANGUAGES = `
  query Languages {
    languages { id code name }
  }
`;

export const UPDATE_STUDENT_LANGUAGES = `
  mutation UpdateStudentLanguages($studentId: ID!, $input: UpdateAdminStudentInput!) {
    updateStudentLanguages(studentId: $studentId, input: $input) {
      id
      nativeLanguageId
      learningLanguageIds
      teacherId
      displayColor
    }
  }
`;

export const WORDS_BY_IDS = `
  query WordsByIds($ids: [ID!]!) {
    wordsByIds(ids: $ids) { ${WORD_CARD_FIELDS} }
  }
`;

export const STUDENT_VOCABULARY = `
  query StudentVocabulary($studentId: ID) {
    studentVocabulary(studentId: $studentId) {
      ${STUDENT_WORD_CARD_FIELDS}
      word { ${WORD_CARD_FIELDS} }
    }
  }
`;

export const STUDENT_VOCABULARY_PAGE = `
  query StudentVocabularyPage($studentId: ID, $cursor: String, $limit: Int) {
    studentVocabularyPage(studentId: $studentId, cursor: $cursor, limit: $limit) {
      hasMore
      nextCursor
      items {
        ${STUDENT_WORD_CARD_FIELDS}
        word { ${WORD_CARD_FIELDS} }
      }
    }
  }
`;

export const ADD_STUDENT_WORD_CARD = `
  mutation AddStudentWordCard($input: CreateStudentWordCardInput!, $studentId: ID) {
    addStudentWordCard(input: $input, studentId: $studentId) {
      ${STUDENT_WORD_CARD_FIELDS}
      word { ${WORD_CARD_FIELDS} }
    }
  }
`;

export const UPDATE_CARD_STATUS = `
  mutation UpdateCardStatus($input: UpdateCardStatusInput!, $studentId: ID) {
    updateCardStatus(input: $input, studentId: $studentId) {
      ${STUDENT_WORD_CARD_FIELDS}
    }
  }
`;

export const DELETE_STUDENT_WORD_CARD = `
  mutation DeleteStudentWordCard($cardId: ID!, $studentId: ID!) {
    deleteStudentWordCard(cardId: $cardId, studentId: $studentId)
  }
`;

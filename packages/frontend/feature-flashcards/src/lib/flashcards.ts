import { create } from 'zustand';

type FlashcardSessionState = {
  currentCardIndex: number;
  isAnswerVisible: boolean;
  showAnswer: () => void;
  hideAnswer: () => void;
  nextCard: () => void;
  resetSession: () => void;
};

export const useFlashcardSessionStore = create<FlashcardSessionState>((set) => ({
  currentCardIndex: 0,
  isAnswerVisible: false,
  showAnswer: () => set({ isAnswerVisible: true }),
  hideAnswer: () => set({ isAnswerVisible: false }),
  nextCard: () =>
    set((state) => ({
      currentCardIndex: state.currentCardIndex + 1,
      isAnswerVisible: false,
    })),
  resetSession: () => set({ currentCardIndex: 0, isAnswerVisible: false }),
}));

import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface SearchHistory {
  word: string
  timestamp: string
}

interface DictionaryState {
  searchHistory: SearchHistory[]
  currentFont: 'sans' | 'serif' | 'mono'
}

const initialState: DictionaryState = {
  searchHistory: [],
  currentFont: 'sans',
}

export const dictionarySlice = createSlice({
  name: 'dictionary',
  initialState,
  reducers: {
    addToHistory: (state, action: PayloadAction<SearchHistory>) => {
      state.searchHistory = [action.payload, ...state.searchHistory]
    },
    setFont: (state, action: PayloadAction<'sans' | 'serif' | 'mono'>) => {
      state.currentFont = action.payload
    },
  },
})

export const { addToHistory, setFont } = dictionarySlice.actions
export default dictionarySlice.reducer
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import dictionaryReducer from '@/lib/redux/features/dictionarySlice'
import Home from '@/app/page'

// Mock store
const store = configureStore({
  reducer: {
    dictionary: dictionaryReducer,
  },
})

// Mock next/themes
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
  }),
}))

describe('Home', () => {
  it('renders the search input', () => {
    render(
      <Provider store={store}>
        <Home />
      </Provider>
    )
    expect(screen.getByPlaceholderText('Search for a word...')).toBeInTheDocument()
  })

  it('shows error toast when searching with empty input', () => {
    render(
      <Provider store={store}>
        <Home />
      </Provider>
    )
    
    const searchButton = screen.getByRole('button')
    fireEvent.click(searchButton)
    
    expect(screen.getByText('Please enter a word to search')).toBeInTheDocument()
  })
})
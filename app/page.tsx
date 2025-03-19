'use client'

import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Search, Volume2, History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTheme } from 'next-themes'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { addToHistory, setFont } from '@/lib/redux/features/dictionarySlice'
import type { RootState } from '@/lib/redux/store'
import type { WordDefinition } from '@/lib/types'

export default function Home() {
  const [word, setWord] = useState('')
  const [definition, setDefinition] = useState<WordDefinition | null>(null)
  const [loading, setLoading] = useState(false)
  const { theme, setTheme } = useTheme()
  const dispatch = useDispatch()
  const { searchHistory, currentFont } = useSelector((state: RootState) => state.dictionary)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!word.trim()) {
      toast.error('Please enter a word to search')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.trim()}`)
      if (!response.ok) {
        throw new Error('Word not found')
      }
      const data = await response.json()
      setDefinition(data[0])
      dispatch(addToHistory({
        word: word.trim(),
        timestamp: new Date().toISOString(),
      }))
    } catch (error) {
      toast.error('No definitions found')
      setDefinition(null)
    } finally {
      setLoading(false)
    }
  }

  const playAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl)
    audio.play()
  }

  const fontClasses = {
    sans: 'font-sans',
    serif: 'font-serif',
    mono: 'font-mono',
  }

  return (
    <div className={`min-h-screen bg-background ${fontClasses[currentFont]} p-4 md:p-8 max-w-4xl mx-auto`}>
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Dictionary</h1>
        <div className="flex items-center gap-4">
          <Select value={currentFont} onValueChange={(value: 'sans' | 'serif' | 'mono') => dispatch(setFont(value))}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Font" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sans">Sans Serif</SelectItem>
              <SelectItem value="serif">Serif</SelectItem>
              <SelectItem value="mono">Monospace</SelectItem>
            </SelectContent>
          </Select>
          <Select value={theme} onValueChange={setTheme}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <History className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Search History</DialogTitle>
              </DialogHeader>
              <div className="max-h-96 overflow-y-auto">
                {searchHistory.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-2 hover:bg-accent rounded">
                    <span className="font-medium">{item.word}</span>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(item.timestamp), 'PPpp')}
                    </span>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <Input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="Search for a word..."
            className="flex-1"
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Searching...' : <Search className="h-4 w-4" />}
          </Button>
        </div>
      </form>

      {definition && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-4xl font-bold mb-2">{definition.word}</h2>
              <p className="text-xl text-primary">{definition.phonetic}</p>
            </div>
            {definition.phonetics.find(p => p.audio) && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  const audio = definition.phonetics.find(p => p.audio)?.audio
                  if (audio) playAudio(audio)
                }}
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          {definition.meanings.map((meaning, index) => (
            <div key={index} className="space-y-4">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-semibold">{meaning.partOfSpeech}</h3>
                <div className="h-px flex-1 bg-border" />
              </div>

              <div className="space-y-4">
                <h4 className="text-muted-foreground">Meaning</h4>
                <ul className="list-disc list-inside space-y-2">
                  {meaning.definitions.map((def, idx) => (
                    <li key={idx} className="text-lg">
                      {def.definition}
                      {def.example && (
                        <p className="mt-2 text-muted-foreground italic">
                          "{def.example}"
                        </p>
                      )}
                    </li>
                  ))}
                </ul>

                {meaning.definitions[0].synonyms.length > 0 && (
                  <div className="mt-4">
                    <span className="text-muted-foreground">Synonyms: </span>
                    <span className="text-primary">
                      {meaning.definitions[0].synonyms.join(', ')}
                    </span>
                  </div>
                )}

                {meaning.definitions[0].antonyms.length > 0 && (
                  <div className="mt-2">
                    <span className="text-muted-foreground">Antonyms: </span>
                    <span className="text-primary">
                      {meaning.definitions[0].antonyms.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {definition.sourceUrls.length > 0 && (
            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Source: {definition.sourceUrls.map((url, idx) => (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {url}
                  </a>
                ))}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
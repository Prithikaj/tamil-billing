/**
 * VoiceButton — starts/stops browser speech recognition (Tamil).
 * Calls onResult(transcript) when the user stops speaking.
 */

import { useState, useRef } from 'react'

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition

export default function VoiceButton({ onResult, disabled }) {
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef(null)

  const start = () => {
    if (!SpeechRecognition) {
      alert('உங்கள் browser-ல் Speech Recognition இல்லை. Chrome-ஐ பயன்படுத்துங்கள்.')
      return
    }

    const rec = new SpeechRecognition()
    rec.lang = 'ta-IN'        // Tamil (India)
    rec.interimResults = false
    rec.maxAlternatives = 1

    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      onResult(transcript)
    }

    rec.onerror = (e) => {
      console.error('Speech error:', e.error)
      setListening(false)
    }

    rec.onend = () => setListening(false)

    rec.start()
    recognitionRef.current = rec
    setListening(true)
  }

  const stop = () => {
    recognitionRef.current?.stop()
    setListening(false)
  }

  return (
    <button
      onClick={listening ? stop : start}
      disabled={disabled}
      className={`
        flex items-center gap-2 px-6 py-4 rounded-2xl text-white font-semibold text-lg
        shadow-lg transition-all duration-200 select-none
        ${listening
          ? 'bg-red-500 recording'
          : 'bg-green-600 hover:bg-green-700 active:scale-95'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      aria-label={listening ? 'Recording — tap to stop' : 'Start voice input'}
    >
      <span className="text-2xl">{listening ? '⏹' : '🎤'}</span>
      <span>{listening ? 'கேட்கிறேன்...' : 'பேசுங்கள்'}</span>
    </button>
  )
}

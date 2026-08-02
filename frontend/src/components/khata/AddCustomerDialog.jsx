/**
 * AddCustomerDialog — modal to add a new credit customer.
 */

import { useState, useRef, useEffect } from 'react'

export default function AddCustomerDialog({ onSave, onCancel }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const nameRef = useRef(null)

  useEffect(() => {
    setTimeout(() => nameRef.current?.focus(), 50)
  }, [])

  const valid = name.trim().length > 0 && phone.trim().length >= 10

  const handleSave = () => {
    if (!valid) return
    onSave(name.trim(), phone.trim())
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-gray-800">புதிய வாடிக்கையாளர்</h2>

        <div>
          <label className="block text-sm text-gray-500 mb-1">பெயர்</label>
          <input
            ref={nameRef}
            className="w-full border rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="உ.ம்: முருகன்"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-500 mb-1">கைபேசி எண்</label>
          <div className="flex gap-2">
            <span className="flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-600 text-sm">
              +91
            </span>
            <input
              type="tel"
              maxLength={10}
              placeholder="10 இலக்கம்"
              className="flex-1 border border-gray-300 rounded-r-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-600 font-semibold hover:bg-gray-50 transition"
          >
            ரத்து
          </button>
          <button
            onClick={handleSave}
            disabled={!valid}
            className="flex-1 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition disabled:opacity-40"
          >
            சேர்
          </button>
        </div>
      </div>
    </div>
  )
}

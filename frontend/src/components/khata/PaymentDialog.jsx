/**
 * PaymentDialog — record a payment from a customer.
 */

import { useState, useRef, useEffect } from 'react'

export default function PaymentDialog({ customer, onSave, onCancel }) {
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [])

  const amountNum = parseFloat(amount)
  const valid = !isNaN(amountNum) && amountNum > 0

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h2 className="text-xl font-bold text-gray-800">பணம் வந்தது</h2>
          <p className="text-sm text-gray-500">{customer.name}</p>
        </div>

        <div>
          <label className="block text-sm text-gray-500 mb-1">தொகை (₹)</label>
          <input
            ref={inputRef}
            type="number"
            min="1"
            placeholder="உ.ம்: 500"
            className="w-full border-2 border-green-500 rounded-lg px-3 py-2 text-xl font-semibold text-gray-800 focus:outline-none"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && valid && onSave(amountNum, note)}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-500 mb-1">குறிப்பு (விரும்பினால்)</label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="உ.ம்: ஜனவரி பணம்"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-600 font-semibold hover:bg-gray-50 transition"
          >
            ரத்து
          </button>
          <button
            onClick={() => onSave(amountNum, note)}
            disabled={!valid}
            className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-40"
          >
            ✅ சேமி
          </button>
        </div>
      </div>
    </div>
  )
}

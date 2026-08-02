/**
 * KhataBillEntry — full-screen bill builder for a khata purchase.
 * Same voice → parse → price flow as the main billing screen,
 * but saves to the customer's credit ledger instead of a printed bill.
 */

import { useState, useCallback } from 'react'
import axios from 'axios'
import VoiceButton from '../VoiceButton'
import PriceDialog from '../PriceDialog'

const API = import.meta.env.VITE_API_URL ?? 'https://tamil-billing.onrender.com'

export default function KhataBillEntry({ customerName, onSave, onCancel }) {
  const [items, setItems] = useState([])
  const [parsedItem, setParsedItem] = useState(null)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const total = items.reduce((s, it) => s + it.subtotal, 0)

  const handleVoiceResult = useCallback(async (transcript) => {
    setStatus(`கேட்டது: "${transcript}"`)
    setLoading(true)
    try {
      const { data } = await axios.post(`${API}/parse`, { text: transcript })
      setParsedItem(data)
      setStatus('')
    } catch (err) {
      setStatus('⚠️ ' + (err.response?.data?.detail ?? err.message))
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSaveItem = (newItem) => {
    setItems((prev) => [...prev, newItem])
    setParsedItem(null)
    setStatus(`✅ ${newItem.product} சேர்க்கப்பட்டது`)
  }

  const handleDelete = (i) => setItems((prev) => prev.filter((_, idx) => idx !== i))

  const handleConfirm = () => {
    if (items.length === 0) return
    onSave(items, parseFloat(total.toFixed(2)))
  }

  return (
    <div className="fixed inset-0 bg-green-50 z-40 flex flex-col">
      {/* Header */}
      <div className="bg-orange-500 text-white px-4 py-3 flex items-center gap-3">
        <button onClick={onCancel} className="text-white text-xl font-bold">←</button>
        <div>
          <p className="font-bold">கடன் வாங்கியது</p>
          <p className="text-orange-100 text-xs">{customerName}</p>
        </div>
      </div>

      {/* Items list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {items.length === 0 ? (
          <div className="text-center text-gray-400 py-12 text-sm">
            🎤 பேசுங்கள் — பொருளை சேர்க்குங்கள்
          </div>
        ) : (
          items.map((it, i) => (
            <div key={i} className="bg-white rounded-xl px-4 py-3 flex items-center justify-between shadow-sm">
              <div>
                <p className="font-semibold text-gray-800">{it.product}</p>
                <p className="text-xs text-gray-400">
                  {it.qty}{it.unit !== 'piece' ? ` ${it.unit}` : ''} × ₹{it.price}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <p className="font-bold text-gray-900">₹{it.subtotal.toFixed(0)}</p>
                <button onClick={() => handleDelete(i)} className="text-red-400 hover:text-red-600">✕</button>
              </div>
            </div>
          ))
        )}

        {status && (
          <div className="text-center text-sm text-gray-500 bg-white rounded-lg py-2 px-4">
            {status}
          </div>
        )}

        {loading && (
          <div className="flex justify-center">
            <div className="w-6 h-6 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Total */}
      {items.length > 0 && (
        <div className="bg-white border-t px-4 py-2 text-right">
          <span className="text-gray-500 text-sm">மொத்தம் </span>
          <span className="font-bold text-lg text-gray-900">₹{total.toFixed(0)}</span>
        </div>
      )}

      {/* Bottom bar */}
      <div className="bg-white border-t p-4 flex gap-3">
        <VoiceButton onResult={handleVoiceResult} disabled={loading} />
        <button
          onClick={handleConfirm}
          disabled={items.length === 0}
          className="flex-1 py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg shadow-lg transition disabled:opacity-40"
        >
          ✅ கடனில் சேர் — ₹{total.toFixed(0)}
        </button>
      </div>

      <PriceDialog
        item={parsedItem}
        onSave={handleSaveItem}
        onCancel={() => setParsedItem(null)}
      />
    </div>
  )
}

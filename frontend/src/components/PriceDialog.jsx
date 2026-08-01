/**
 * PriceDialog — modal that asks for the price after an item is parsed.
 * Shows what was recognised and lets the user confirm / correct before saving.
 */

import { useState, useEffect, useRef } from 'react'

export default function PriceDialog({ item, onSave, onCancel }) {
  const [price, setPrice] = useState('')
  const [product, setProduct] = useState(item?.product ?? '')
  const [qty, setQty] = useState(item?.quantity ?? 1)
  const [unit, setUnit] = useState(item?.unit ?? 'piece')
  const inputRef = useRef(null)

  // Focus price field on open
  useEffect(() => {
    if (item) {
      setProduct(item.product)
      setQty(item.quantity)
      setUnit(item.unit)
      setPrice('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [item])

  if (!item) return null

  const priceNum = parseFloat(price)
  const subtotal = isNaN(priceNum) ? 0 : qty * priceNum

  const handleSave = () => {
    if (!price || isNaN(priceNum) || priceNum <= 0) return
    onSave({
      product,
      qty: parseFloat(qty),
      unit,
      price: priceNum,
      subtotal: parseFloat((parseFloat(qty) * priceNum).toFixed(2)),
    })
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') onCancel()
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      {/* Card */}
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Enter price"
      >
        <h2 className="text-xl font-bold text-gray-800">விலை உள்ளிடுக</h2>

        {/* Editable product name */}
        <div>
          <label className="block text-sm text-gray-500 mb-1">பொருள்</label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
          />
        </div>

        {/* Quantity + Unit row */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm text-gray-500 mb-1">அளவு</label>
            <input
              type="number"
              min="0.25"
              step="0.25"
              className="w-full border rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-gray-500 mb-1">அலகு</label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            />
          </div>
        </div>

        {/* Price input */}
        <div>
          <label className="block text-sm text-gray-500 mb-1">
            {unit && unit !== 'piece' ? `விலை ஒரு ${unit}-க்கு (₹)` : 'விலை (₹)'}
          </label>
          <input
            ref={inputRef}
            type="number"
            min="0"
            step="0.5"
            placeholder="உ.ம்: 58"
            className="w-full border-2 border-green-500 rounded-lg px-3 py-2 text-xl font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            onKeyDown={handleKey}
          />
        </div>

        {/* Live subtotal preview */}
        {price && !isNaN(priceNum) && priceNum > 0 && (
          <div className="bg-green-50 rounded-lg px-4 py-2 text-center text-green-800 font-semibold text-lg">
            {qty} × ₹{priceNum} = <span className="text-xl">₹{subtotal.toFixed(2)}</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-600 font-semibold hover:bg-gray-50 transition"
          >
            ரத்து
          </button>
          <button
            onClick={handleSave}
            disabled={!price || isNaN(priceNum) || priceNum <= 0}
            className="flex-1 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition disabled:opacity-40"
          >
            சேர்
          </button>
        </div>
      </div>
    </div>
  )
}

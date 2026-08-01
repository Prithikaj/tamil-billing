/**
 * ItemCard — one row in the bill table.
 * Supports inline edit of price and delete.
 */

import { useState } from 'react'

export default function ItemCard({ item, index, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false)
  const [newPrice, setNewPrice] = useState(item.price)

  const saveEdit = () => {
    const p = parseFloat(newPrice)
    if (!isNaN(p) && p > 0) {
      onEdit(index, { ...item, price: p, subtotal: parseFloat((item.qty * p).toFixed(2)) })
    }
    setEditing(false)
  }

  return (
    <tr className="border-b border-gray-100 hover:bg-green-50 transition-colors">
      {/* Product */}
      <td className="py-3 px-2 text-gray-800 font-medium">
        {item.product}
        {item.unit && item.unit !== 'piece' && (
          <span className="ml-1 text-xs text-gray-400">({item.unit})</span>
        )}
      </td>

      {/* Qty */}
      <td className="py-3 px-2 text-center text-gray-700">{item.qty}</td>

      {/* Rate — tappable to edit */}
      <td className="py-3 px-2 text-center text-gray-700">
        {editing ? (
          <input
            type="number"
            className="w-20 border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            value={newPrice}
            autoFocus
            onChange={(e) => setNewPrice(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={(e) => { if (e.key === 'Enter') saveEdit() }}
          />
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="underline decoration-dotted text-green-700 hover:text-green-900"
            title="தொகையை திருத்த தட்டுங்கள்"
          >
            ₹{item.price}
          </button>
        )}
      </td>

      {/* Subtotal */}
      <td className="py-3 px-2 text-right font-semibold text-gray-900">
        ₹{item.subtotal.toFixed(2)}
      </td>

      {/* Delete */}
      <td className="py-3 px-2 text-center">
        <button
          onClick={() => onDelete(index)}
          className="text-red-400 hover:text-red-600 text-lg leading-none"
          aria-label="Delete item"
          title="நீக்கு"
        >
          ✕
        </button>
      </td>
    </tr>
  )
}

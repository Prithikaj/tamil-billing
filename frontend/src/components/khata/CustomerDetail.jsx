/**
 * CustomerDetail — full ledger for one customer.
 * Shows all purchases and payments, running balance, WhatsApp button.
 */

import { useState } from 'react'
import PaymentDialog from './PaymentDialog'

export default function CustomerDetail({
  customer,
  balance,
  onBack,
  onAddPurchase,
  onAddPayment,
  onDeleteTransaction,
  onDeleteCustomer,
  whatsAppLink,
}) {
  const [showPayment, setShowPayment] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handlePayment = (amount, note) => {
    onAddPayment(amount, note)
    setShowPayment(false)
  }

  // Sort transactions newest first for display
  const txSorted = [...customer.transactions].reverse()

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onBack}
          className="text-green-700 font-semibold text-lg px-1"
          aria-label="Back"
        >
          ← 
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-gray-800">{customer.name}</h2>
          <p className="text-xs text-gray-400">📱 {customer.phone}</p>
        </div>
        <button
          onClick={() => setConfirmDelete(true)}
          className="text-red-400 hover:text-red-600 text-sm"
        >
          🗑
        </button>
      </div>

      {/* Balance card */}
      <div className={`rounded-2xl p-4 mb-4 text-center ${balance > 0 ? 'bg-red-50' : balance < 0 ? 'bg-blue-50' : 'bg-green-50'}`}>
        <p className="text-sm text-gray-500 mb-1">
          {balance > 0 ? 'மீதி கடன்' : balance < 0 ? 'திரும்ப தர வேண்டியது' : 'கடன் இல்லை'}
        </p>
        <p className={`text-4xl font-bold ${balance > 0 ? 'text-red-500' : balance < 0 ? 'text-blue-600' : 'text-green-600'}`}>
          ₹{Math.abs(balance).toFixed(0)}
        </p>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <button
          onClick={onAddPurchase}
          className="flex flex-col items-center gap-1 bg-orange-500 text-white py-3 rounded-xl font-semibold text-xs hover:bg-orange-600 transition"
        >
          <span className="text-xl">🛒</span>
          <span>வாங்கியது</span>
        </button>
        <button
          onClick={() => setShowPayment(true)}
          className="flex flex-col items-center gap-1 bg-blue-600 text-white py-3 rounded-xl font-semibold text-xs hover:bg-blue-700 transition"
        >
          <span className="text-xl">💰</span>
          <span>பணம் வந்தது</span>
        </button>
        <a
          href={whatsAppLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 bg-[#25D366] text-white py-3 rounded-xl font-semibold text-xs hover:bg-[#1ebe5d] transition"
        >
          <span className="text-xl">📲</span>
          <span>அனுப்பு</span>
        </a>
      </div>

      {/* Transaction list */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {txSorted.length === 0 ? (
          <div className="text-center text-gray-400 py-10 text-sm">
            இன்னும் எந்த பதிவும் இல்லை
          </div>
        ) : (
          txSorted.map((tx) => {
            const d = new Date(tx.date).toLocaleDateString('en-IN', {
              day: '2-digit', month: 'short', year: '2-digit',
            })
            const isPurchase = tx.type === 'purchase'
            return (
              <div
                key={tx.id}
                className={`bg-white rounded-xl px-4 py-3 flex items-center justify-between shadow-sm border-l-4 ${isPurchase ? 'border-red-400' : 'border-green-400'}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{isPurchase ? '🛒' : '✅'}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800 leading-tight">
                      {tx.note}
                    </p>
                    <p className="text-xs text-gray-400">{d}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className={`font-bold ${isPurchase ? 'text-red-500' : 'text-green-600'}`}>
                    {isPurchase ? '+' : '-'}₹{tx.amount.toFixed(0)}
                  </p>
                  <button
                    onClick={() => onDeleteTransaction(tx.id)}
                    className="text-gray-300 hover:text-red-400 text-sm ml-1"
                    title="நீக்கு"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Payment dialog */}
      {showPayment && (
        <PaymentDialog
          customer={customer}
          onSave={handlePayment}
          onCancel={() => setShowPayment(false)}
        />
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h3 className="font-bold text-gray-800">இந்த கணக்கை நீக்கவா?</h3>
            <p className="text-sm text-gray-500">{customer.name} -ன் எல்லா பதிவுகளும் நீங்கிவிடும்.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-600 font-semibold"
              >
                வேண்டாம்
              </button>
              <button
                onClick={onDeleteCustomer}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold"
              >
                நீக்கு
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

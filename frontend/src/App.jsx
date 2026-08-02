/**
 * App.jsx — Tamil Voice Billing Assistant
 *
 * Flow:
 *  1. User taps 🎤 → browser speech recognition starts (Tamil)
 *  2. Transcript sent to POST /parse → { product, quantity, unit }
 *  3. PriceDialog opens → user enters price
 *  4. Item added to bill state with subtotal
 *  5. Repeat for more items
 *  6. "பில் முடி" → POST /finish → optional WhatsApp send
 */

import { useState, useCallback } from 'react'
import axios from 'axios'
import Bill from './components/Bill'
import VoiceButton from './components/VoiceButton'
import PriceDialog from './components/PriceDialog'

// In local dev: empty string → Vite proxy handles it
// In production: set VITE_API_URL=https://your-app.onrender.com in Vercel
const API = import.meta.env.VITE_API_URL ?? 'https://tamil-billing.onrender.com'

export default function App() {
  const [items, setItems] = useState([])
  const [parsedItem, setParsedItem] = useState(null)   // pending dialog
  const [status, setStatus] = useState('')             // bottom status bar
  const [loading, setLoading] = useState(false)
  const [finished, setFinished] = useState(false)
  const [finalTotal, setFinalTotal] = useState(0)
  const [mobile, setMobile] = useState('')
  // wa.me link is built client-side; no waResult state needed

  // ------------------------------------------------------------------
  // Derived total
  // ------------------------------------------------------------------
  const total = items.reduce((s, it) => s + it.subtotal, 0)

  // ------------------------------------------------------------------
  // Voice result handler — send to /parse
  // ------------------------------------------------------------------
  const handleVoiceResult = useCallback(async (transcript) => {
    setStatus(`கேட்டது: "${transcript}"`)
    setLoading(true)
    try {
      const { data } = await axios.post(`${API}/parse`, { text: transcript })
      setParsedItem(data)
      setStatus('')
    } catch (err) {
      setStatus('⚠️ பிழை: ' + (err.response?.data?.detail ?? err.message))
    } finally {
      setLoading(false)
    }
  }, [])

  // ------------------------------------------------------------------
  // Save item from PriceDialog
  // ------------------------------------------------------------------
  const handleSaveItem = (newItem) => {
    setItems((prev) => [...prev, newItem])
    setParsedItem(null)
    setStatus(`✅ ${newItem.product} சேர்க்கப்பட்டது`)
  }

  // ------------------------------------------------------------------
  // Delete / Edit handlers
  // ------------------------------------------------------------------
  const handleDelete = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
    setStatus('ஒரு பொருள் நீக்கப்பட்டது')
  }

  const handleEdit = (index, updatedItem) => {
    setItems((prev) => prev.map((it, i) => (i === index ? updatedItem : it)))
  }

  // ------------------------------------------------------------------
  // Finish bill
  // ------------------------------------------------------------------
  const handleFinish = async () => {
    if (items.length === 0) {
      setStatus('⚠️ பில்லில் எந்த பொருளும் இல்லை!')
      return
    }
    setLoading(true)
    try {
      const { data } = await axios.post(`${API}/finish`, {
        items,
      })
      setFinalTotal(data.total)
      setFinished(true)
    } catch (err) {
      setStatus('⚠️ ' + (err.response?.data?.detail ?? err.message))
    } finally {
      setLoading(false)
    }
  }

  // ------------------------------------------------------------------
  // New bill
  // ------------------------------------------------------------------
  const handleNewBill = () => {
    setItems([])
    setFinished(false)
    setFinalTotal(0)
    setMobile('')
    setStatus('')
  }

  // ------------------------------------------------------------------
  // Print bill (browser print dialog)
  // ------------------------------------------------------------------
  const handlePrint = () => window.print()

  // ------------------------------------------------------------------
  // Build WhatsApp wa.me link — no backend / no account needed
  // Opens WhatsApp with the bill text pre-filled in the chat
  // ------------------------------------------------------------------
  const buildWhatsAppLink = () => {
    const dateStr = new Date().toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    })
    let text = `🧾 *JAYA VILAS*\nCheran Nagar\nDate: ${dateStr}\n─────────────────\n`
    items.forEach((it) => {
      const unit = it.unit && it.unit !== 'piece' ? ` ${it.unit}` : ''
      text += `• ${it.product}  ${it.qty}${unit}  ×  ₹${it.price}  =  *₹${it.subtotal.toFixed(0)}*\n`
    })
    text += `─────────────────\n*TOTAL  ₹${finalTotal.toFixed(0)}*\n─────────────────\nThank you! 🙏`

    const phone = mobile.trim()
      ? (mobile.trim().startsWith('+') ? mobile.trim().replace('+', '') : `91${mobile.trim()}`)
      : ''

    const encoded = encodeURIComponent(text)
    return phone
      ? `https://wa.me/${phone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`
  }

  // ------------------------------------------------------------------
  // Finished screen
  // ------------------------------------------------------------------
  if (finished) {
    const billDate = new Date().toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })

    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50 p-4 print:bg-white">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md print:shadow-none print:rounded-none">

          {/* Store header */}
          <div className="bg-green-700 text-white rounded-t-2xl print:rounded-none px-6 pt-5 pb-4">
            <div className="flex items-start justify-between">
              {/* Store name + address */}
              <div>
                <h1 className="text-2xl font-bold tracking-wide leading-tight">JAYA VILAS</h1>
                <p className="text-green-200 text-sm mt-0.5">Cheran Nagar</p>
              </div>
              {/* Date top-right */}
              <div className="text-right text-green-200 text-xs leading-snug mt-1">
                <div>{billDate}</div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {/* Bill table */}
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-1">பொருள்</th>
                  <th className="text-center py-1">அளவு</th>
                  <th className="text-right py-1">விலை</th>
                  <th className="text-right py-1">மொத்தம்</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-1.5">{it.product}</td>
                    <td className="py-1.5 text-center">{it.qty}{it.unit && it.unit !== 'piece' ? ` ${it.unit}` : ''}</td>
                    <td className="py-1.5 text-right">₹{it.price}</td>
                    <td className="py-1.5 text-right font-semibold">₹{it.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-green-700">
                  <td colSpan={3} className="py-2 font-bold text-green-800">மொத்தம்</td>
                  <td className="py-2 text-right font-bold text-green-900 text-xl">₹{finalTotal.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>

            <p className="text-center text-gray-400 text-xs">நன்றி! மீண்டும் வாருங்கள் 🙏</p>

            {/* Action buttons */}
            <div className="flex flex-col gap-3 print:hidden">

              {/* WhatsApp share — opens wa.me with bill pre-filled */}
              <a
                href={buildWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#25D366] text-white font-semibold hover:bg-[#1ebe5d] transition"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.534 5.864L.054 23.447a.75.75 0 0 0 .918.943l5.698-1.49A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.714 9.714 0 0 1-4.96-1.355l-.355-.212-3.683.964.981-3.588-.232-.371A9.712 9.712 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
                </svg>
                <span>WhatsApp-ல் அனுப்பு</span>
              </a>

              <div className="flex gap-3">
                <button
                  onClick={handlePrint}
                  className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
                >
                  🖨️ அச்சிடு
                </button>
                <button
                  onClick={handleNewBill}
                  className="flex-1 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition"
                >
                  புதிய பில்
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ------------------------------------------------------------------
  // Main screen
  // ------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-green-50 flex flex-col">
      {/* Header */}
      <header className="bg-green-700 text-white text-center py-4 shadow-md">
        <h1 className="text-2xl font-bold tracking-wide">🛒 VOICE BILLING</h1>
        <p className="text-green-200 text-sm mt-0.5">Tamil Voice Billing Assistant</p>
      </header>

      {/* Bill area */}
      <main className="flex-1 p-4 max-w-2xl mx-auto w-full space-y-4">
        <Bill
          items={items}
          total={total}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />

        {/* Status bar */}
        {status && (
          <div className="text-center text-sm text-gray-600 bg-white rounded-lg py-2 px-4 shadow-sm">
            {status}
          </div>
        )}

        {/* Loading spinner */}
        {loading && (
          <div className="flex justify-center">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* WhatsApp mobile number input */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span>📱</span> WhatsApp-ல் பில் அனுப்ப வாடிக்கையாளர் எண் (விரும்பினால்)
          </label>
          <div className="flex gap-2">
            <span className="flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-600 text-sm">
              +91
            </span>
            <input
              type="tel"
              maxLength={10}
              placeholder="கைபேசி எண் (10 இலக்கம்)"
              className="flex-1 border border-gray-300 rounded-r-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
            />
          </div>
        </div>
      </main>

      {/* Sticky bottom action bar — sits above the global tab bar (h-16) */}
      <footer className="sticky bottom-16 bg-white border-t border-gray-200 shadow-up p-4 z-20">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <VoiceButton
            onResult={handleVoiceResult}
            disabled={loading}
          />
          <button
            onClick={handleFinish}
            disabled={items.length === 0 || loading}
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg shadow-lg transition disabled:opacity-40"
          >
            <span>✅</span>
            <span>பில் முடி</span>
            {items.length > 0 && (
              <span className="bg-white text-blue-700 rounded-full px-2 py-0.5 text-sm font-bold ml-1">
                ₹{total.toFixed(0)}
              </span>
            )}
          </button>
        </div>
      </footer>

      {/* Price dialog (portal-style overlay) */}
      <PriceDialog
        item={parsedItem}
        onSave={handleSaveItem}
        onCancel={() => setParsedItem(null)}
      />
    </div>
  )
}

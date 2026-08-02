/**
 * useKhata — manages credit customer data via the FastAPI backend (PostgreSQL).
 * All customer and transaction data is stored server-side.
 * WhatsApp link is still built client-side.
 */

import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL ?? 'https://tamil-billing.onrender.com'

export function useKhata() {
  // customers is a plain object keyed by id (same shape as before so UI doesn't change)
  const [customers, setCustomers] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // ── Helpers ─────────────────────────────────────────────────────
  // Convert the server's array response into the id-keyed map the UI expects
  const toMap = (list) =>
    Object.fromEntries(
      list.map((c) => [
        String(c.id),
        {
          ...c,
          id: String(c.id),
          transactions: c.transactions.map((tx) => ({
            ...tx,
            id: String(tx.id),
            date: tx.created_at,
          })),
        },
      ])
    )

  // ── Load all customers on mount ──────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await axios.get(`${API}/customers`)
      setCustomers(toMap(data))
      setError(null)
    } catch (e) {
      setError('வாடிக்கையாளர்களை ஏற்ற முடியவில்லை')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  // ── Add a new customer ───────────────────────────────────────────
  const addCustomer = async (name, phone) => {
    const { data } = await axios.post(`${API}/customers`, { name, phone })
    const c = {
      ...data,
      id: String(data.id),
      transactions: [],
    }
    setCustomers((prev) => ({ ...prev, [c.id]: c }))
    return c.id
  }

  // ── Delete a customer ────────────────────────────────────────────
  const deleteCustomer = async (id) => {
    await axios.delete(`${API}/customers/${id}`)
    setCustomers((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  // ── Add a purchase transaction ───────────────────────────────────
  const addPurchase = async (customerId, items, total) => {
    const { data } = await axios.post(`${API}/customers/${customerId}/purchase`, {
      items,
      total,
    })
    setCustomers((prev) => ({
      ...prev,
      [customerId]: {
        ...data,
        id: String(data.id),
        transactions: data.transactions.map((tx) => ({
          ...tx,
          id: String(tx.id),
          date: tx.created_at,
        })),
      },
    }))
  }

  // ── Record a payment ─────────────────────────────────────────────
  const addPayment = async (customerId, amount, note = '') => {
    const { data } = await axios.post(`${API}/customers/${customerId}/payment`, {
      amount,
      note,
    })
    setCustomers((prev) => ({
      ...prev,
      [customerId]: {
        ...data,
        id: String(data.id),
        transactions: data.transactions.map((tx) => ({
          ...tx,
          id: String(tx.id),
          date: tx.created_at,
        })),
      },
    }))
  }

  // ── Delete a single transaction ──────────────────────────────────
  const deleteTransaction = async (customerId, txId) => {
    const { data } = await axios.delete(
      `${API}/customers/${customerId}/transactions/${txId}`
    )
    setCustomers((prev) => ({
      ...prev,
      [customerId]: {
        ...data,
        id: String(data.id),
        transactions: data.transactions.map((tx) => ({
          ...tx,
          id: String(tx.id),
          date: tx.created_at,
        })),
      },
    }))
  }

  // ── Computed balance (server also returns it, but keep local too) ─
  const getBalance = (customerId) => {
    const c = customers[customerId]
    if (!c) return 0
    // Use server-computed balance if present
    if (typeof c.balance === 'number') return c.balance
    return c.transactions.reduce(
      (sum, tx) => (tx.type === 'purchase' ? sum + tx.amount : sum - tx.amount),
      0
    )
  }

  // ── Build WhatsApp link (client-side, no API needed) ─────────────
  const buildWhatsAppLink = (customerId) => {
    const c = customers[customerId]
    if (!c) return ''

    const balance = getBalance(customerId)
    const dateStr = new Date().toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    })

    let text = `🏪 *JAYA VILAS* - Cheran Nagar\n`
    text += `📋 *கடன் கணக்கு - ${c.name}*\n`
    text += `தேதி: ${dateStr}\n`
    text += `─────────────────────\n`

    c.transactions.forEach((tx) => {
      const d = new Date(tx.date).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short',
      })
      if (tx.type === 'purchase') {
        text += `🛒 ${d}: ${tx.note} = *₹${tx.amount.toFixed(0)}* (வாங்கியது)\n`
      } else {
        text += `✅ ${d}: ${tx.note} = *₹${tx.amount.toFixed(0)}* (கட்டியது)\n`
      }
    })

    text += `─────────────────────\n`
    if (balance > 0) {
      text += `*மீதி கடன்: ₹${balance.toFixed(0)}*\n`
      text += `தயவுசெய்து கட்டுங்கள் 🙏`
    } else if (balance < 0) {
      text += `*உங்களுக்கு திரும்ப தர வேண்டியது: ₹${Math.abs(balance).toFixed(0)}*`
    } else {
      text += `*கடன் இல்லை! நன்றி 🙏*`
    }

    const phone = c.phone.startsWith('+')
      ? c.phone.replace('+', '')
      : `91${c.phone}`

    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
  }

  return {
    customers,
    loading,
    error,
    addCustomer,
    deleteCustomer,
    addPurchase,
    addPayment,
    deleteTransaction,
    getBalance,
    buildWhatsAppLink,
    refresh: fetchAll,
  }
}

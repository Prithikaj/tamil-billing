/**
 * useKhata — manages credit customer data in localStorage.
 *
 * Data shape:
 * {
 *   [customerId]: {
 *     id: string,
 *     name: string,
 *     phone: string,
 *     createdAt: string,
 *     transactions: [
 *       {
 *         id: string,
 *         type: 'purchase' | 'payment',
 *         date: string,
 *         amount: number,         // always positive
 *         note: string,           // bill summary or payment note
 *         items: []               // only for purchase type
 *       }
 *     ]
 *   }
 * }
 */

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'jaya_vilas_khata'

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export function useKhata() {
  const [customers, setCustomers] = useState(load)

  // Persist to localStorage on every change
  useEffect(() => {
    save(customers)
  }, [customers])

  // ── Add a new customer ──────────────────────────────────────────
  const addCustomer = (name, phone) => {
    const id = uid()
    setCustomers((prev) => ({
      ...prev,
      [id]: {
        id,
        name: name.trim(),
        phone: phone.trim(),
        createdAt: new Date().toISOString(),
        transactions: [],
      },
    }))
    return id
  }

  // ── Delete a customer ───────────────────────────────────────────
  const deleteCustomer = (id) => {
    setCustomers((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  // ── Add a purchase transaction ──────────────────────────────────
  const addPurchase = (customerId, items, total) => {
    const note = items.map((it) => `${it.product} x${it.qty}`).join(', ')
    const tx = {
      id: uid(),
      type: 'purchase',
      date: new Date().toISOString(),
      amount: total,
      note,
      items,
    }
    setCustomers((prev) => ({
      ...prev,
      [customerId]: {
        ...prev[customerId],
        transactions: [...prev[customerId].transactions, tx],
      },
    }))
  }

  // ── Record a payment ────────────────────────────────────────────
  const addPayment = (customerId, amount, note = '') => {
    const tx = {
      id: uid(),
      type: 'payment',
      date: new Date().toISOString(),
      amount: parseFloat(amount),
      note: note || 'Payment received',
      items: [],
    }
    setCustomers((prev) => ({
      ...prev,
      [customerId]: {
        ...prev[customerId],
        transactions: [...prev[customerId].transactions, tx],
      },
    }))
  }

  // ── Delete a single transaction ─────────────────────────────────
  const deleteTransaction = (customerId, txId) => {
    setCustomers((prev) => ({
      ...prev,
      [customerId]: {
        ...prev[customerId],
        transactions: prev[customerId].transactions.filter((t) => t.id !== txId),
      },
    }))
  }

  // ── Computed balance for a customer ────────────────────────────
  const getBalance = (customerId) => {
    const c = customers[customerId]
    if (!c) return 0
    return c.transactions.reduce((sum, tx) => {
      return tx.type === 'purchase' ? sum + tx.amount : sum - tx.amount
    }, 0)
  }

  // ── Build WhatsApp message for a customer ───────────────────────
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
    addCustomer,
    deleteCustomer,
    addPurchase,
    addPayment,
    deleteTransaction,
    getBalance,
    buildWhatsAppLink,
  }
}

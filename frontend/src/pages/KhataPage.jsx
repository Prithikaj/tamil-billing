/**
 * KhataPage — Credit ledger page backed by PostgreSQL.
 */

import { useState } from 'react'
import { useKhata } from '../hooks/useKhata'
import CustomerList from '../components/khata/CustomerList'
import CustomerDetail from '../components/khata/CustomerDetail'
import AddCustomerDialog from '../components/khata/AddCustomerDialog'
import KhataBillEntry from '../components/khata/KhataBillEntry'

export default function KhataPage() {
  const {
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
    refresh,
  } = useKhata()

  const [selectedId, setSelectedId] = useState(null)
  const [showAddCustomer, setShowAddCustomer] = useState(false)
  const [showBillEntry, setShowBillEntry] = useState(false)
  const [saving, setSaving] = useState(false)

  const selected = selectedId ? customers[selectedId] : null

  const handleAddCustomer = async (name, phone) => {
    setSaving(true)
    try {
      const id = await addCustomer(name, phone)
      setSelectedId(id)
      setShowAddCustomer(false)
    } finally {
      setSaving(false)
    }
  }

  const handleAddPurchase = async (items, total) => {
    setSaving(true)
    try {
      await addPurchase(selectedId, items, total)
      setShowBillEntry(false)
    } finally {
      setSaving(false)
    }
  }

  const handleAddPayment = async (amount, note) => {
    setSaving(true)
    try {
      await addPayment(selectedId, amount, note)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteTransaction = async (txId) => {
    await deleteTransaction(selectedId, txId)
  }

  const handleDeleteCustomer = async () => {
    await deleteCustomer(selectedId)
    setSelectedId(null)
  }

  return (
    <div className="min-h-screen bg-green-50 flex flex-col">
      {/* Header */}
      <header className="bg-green-700 text-white text-center py-4 shadow-md">
        <h1 className="text-2xl font-bold tracking-wide">📒 KHATA</h1>
        <p className="text-green-200 text-sm mt-0.5">கடன் கணக்கு</p>
      </header>

      {/* Content */}
      <main className="flex-1 p-4 max-w-2xl mx-auto w-full overflow-hidden flex flex-col">

        {/* Loading state */}
        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <p className="text-red-500 text-sm">{error}</p>
            <button
              onClick={refresh}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm"
            >
              மீண்டும் முயற்சி
            </button>
          </div>
        )}

        {/* Saving overlay */}
        {saving && (
          <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl px-6 py-4 flex items-center gap-3 shadow-xl">
              <div className="w-6 h-6 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-700 font-medium">சேமிக்கிறது...</span>
            </div>
          </div>
        )}

        {!loading && !error && (
          selected ? (
            <CustomerDetail
              customer={selected}
              balance={getBalance(selectedId)}
              whatsAppLink={buildWhatsAppLink(selectedId)}
              onBack={() => setSelectedId(null)}
              onAddPurchase={() => setShowBillEntry(true)}
              onAddPayment={handleAddPayment}
              onDeleteTransaction={handleDeleteTransaction}
              onDeleteCustomer={handleDeleteCustomer}
            />
          ) : (
            <CustomerList
              customers={customers}
              getBalance={getBalance}
              onSelect={setSelectedId}
              onAdd={() => setShowAddCustomer(true)}
            />
          )
        )}
      </main>

      {showAddCustomer && (
        <AddCustomerDialog
          onSave={handleAddCustomer}
          onCancel={() => setShowAddCustomer(false)}
        />
      )}

      {showBillEntry && selected && (
        <KhataBillEntry
          customerName={selected.name}
          onSave={handleAddPurchase}
          onCancel={() => setShowBillEntry(false)}
        />
      )}
    </div>
  )
}

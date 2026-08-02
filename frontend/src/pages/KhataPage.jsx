/**
 * KhataPage — Credit ledger page.
 * Accessible from the main app via the bottom nav tab.
 */

import { useState } from 'react'
import { useKhata } from '../hooks/useKhata'
import CustomerList from '../components/khata/CustomerList'
import CustomerDetail from '../components/khata/CustomerDetail'
import AddCustomerDialog from '../components/khata/AddCustomerDialog'

// Mini bill builder used when adding a purchase to a customer
import KhataBillEntry from '../components/khata/KhataBillEntry'

export default function KhataPage() {
  const {
    customers,
    addCustomer,
    deleteCustomer,
    addPurchase,
    addPayment,
    deleteTransaction,
    getBalance,
    buildWhatsAppLink,
  } = useKhata()

  const [selectedId, setSelectedId] = useState(null)
  const [showAddCustomer, setShowAddCustomer] = useState(false)
  const [showBillEntry, setShowBillEntry] = useState(false)

  const selected = selectedId ? customers[selectedId] : null

  const handleAddCustomer = (name, phone) => {
    const id = addCustomer(name, phone)
    setSelectedId(id)
    setShowAddCustomer(false)
  }

  const handleAddPurchase = (items, total) => {
    addPurchase(selectedId, items, total)
    setShowBillEntry(false)
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
        {selected ? (
          <CustomerDetail
            customer={selected}
            balance={getBalance(selectedId)}
            whatsAppLink={buildWhatsAppLink(selectedId)}
            onBack={() => setSelectedId(null)}
            onAddPurchase={() => setShowBillEntry(true)}
            onAddPayment={(amount, note) => addPayment(selectedId, amount, note)}
            onDeleteTransaction={(txId) => deleteTransaction(selectedId, txId)}
            onDeleteCustomer={() => {
              deleteCustomer(selectedId)
              setSelectedId(null)
            }}
          />
        ) : (
          <CustomerList
            customers={customers}
            getBalance={getBalance}
            onSelect={setSelectedId}
            onAdd={() => setShowAddCustomer(true)}
          />
        )}
      </main>

      {/* Add customer dialog */}
      {showAddCustomer && (
        <AddCustomerDialog
          onSave={handleAddCustomer}
          onCancel={() => setShowAddCustomer(false)}
        />
      )}

      {/* Bill entry for khata purchase */}
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

/**
 * Root — top-level tab navigation between Billing and Khata.
 */

import { useState } from 'react'
import App from './App'
import KhataPage from './pages/KhataPage'

export default function Root() {
  const [tab, setTab] = useState('billing') // 'billing' | 'khata'

  return (
    <div className="flex flex-col min-h-screen">
      {/* Page content */}
      <div className="flex-1">
        {tab === 'billing' ? <App /> : <KhataPage />}
      </div>

      {/* Tab bar — always visible at bottom */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-30 print:hidden">
        <button
          onClick={() => setTab('billing')}
          className={`flex-1 flex flex-col items-center py-2 text-xs font-semibold transition
            ${tab === 'billing' ? 'text-green-700' : 'text-gray-400'}`}
        >
          <span className="text-2xl">🛒</span>
          <span>பில்லிங்</span>
          {tab === 'billing' && <span className="w-8 h-0.5 bg-green-600 rounded-full mt-0.5" />}
        </button>

        <button
          onClick={() => setTab('khata')}
          className={`flex-1 flex flex-col items-center py-2 text-xs font-semibold transition
            ${tab === 'khata' ? 'text-orange-600' : 'text-gray-400'}`}
        >
          <span className="text-2xl">📒</span>
          <span>கடன் கணக்கு</span>
          {tab === 'khata' && <span className="w-8 h-0.5 bg-orange-500 rounded-full mt-0.5" />}
        </button>
      </nav>

      {/* Space so footer content isn't hidden behind tab bar */}
      <div className="h-16 print:hidden" />
    </div>
  )
}

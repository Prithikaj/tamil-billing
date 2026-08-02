/**
 * CustomerList — shows all credit customers with their balance.
 */

export default function CustomerList({ customers, getBalance, onSelect, onAdd }) {
  const list = Object.values(customers)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800">கடன் கணக்கு</h2>
          <p className="text-xs text-gray-500">Credit Customers</p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-green-700 transition"
        >
          + புதியவர்
        </button>
      </div>

      {list.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-16 gap-2">
          <div className="text-5xl">📒</div>
          <p className="text-sm">இன்னும் யாரும் இல்லை</p>
          <p className="text-xs">மேலே "+ புதியவர்" அழுத்துங்கள்</p>
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto flex-1">
          {list
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((c) => {
              const balance = getBalance(c.id)
              return (
                <button
                  key={c.id}
                  onClick={() => onSelect(c.id)}
                  className="w-full bg-white rounded-xl shadow-sm p-4 flex items-center justify-between hover:bg-green-50 transition text-left"
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{c.name}</p>
                      <p className="text-xs text-gray-400">📱 {c.phone}</p>
                    </div>
                  </div>
                  {/* Balance badge */}
                  <div className={`text-right`}>
                    <p className={`font-bold text-lg ${balance > 0 ? 'text-red-500' : balance < 0 ? 'text-blue-500' : 'text-green-600'}`}>
                      ₹{Math.abs(balance).toFixed(0)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {balance > 0 ? 'கடன்' : balance < 0 ? 'திரும்ப தர வேண்டும்' : 'சரி ✓'}
                    </p>
                  </div>
                </button>
              )
            })}
        </div>
      )}
    </div>
  )
}

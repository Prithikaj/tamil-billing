/**
 * Bill — full bill table + running total + action footer.
 */

import ItemCard from './ItemCard'

export default function Bill({ items, total, onDelete, onEdit }) {
  if (items.length === 0) {
    return (
      <div className="text-center text-gray-400 py-10 text-base">
        இன்னும் எந்த பொருளும் சேர்க்கப்படவில்லை.
        <br />
        கீழே உள்ள 🎤 பொத்தானை அழுத்துங்கள்!
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-green-700 text-white">
            <th className="py-3 px-2 text-left">பொருள்</th>
            <th className="py-3 px-2 text-center">அளவு</th>
            <th className="py-3 px-2 text-center">விலை</th>
            <th className="py-3 px-2 text-right">மொத்தம்</th>
            <th className="py-3 px-2"></th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {items.map((item, i) => (
            <ItemCard
              key={i}
              item={item}
              index={i}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-green-50 border-t-2 border-green-700">
            <td colSpan={3} className="py-3 px-2 font-bold text-green-800 text-base">
              மொத்தம்
            </td>
            <td className="py-3 px-2 text-right font-bold text-green-900 text-lg">
              ₹{total.toFixed(2)}
            </td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

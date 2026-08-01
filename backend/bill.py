"""
Bill formatting helpers.

WhatsApp delivery is now handled entirely on the frontend via wa.me deep links —
no Twilio account or API keys needed. The bill text is URL-encoded and opened
directly in the customer's WhatsApp app when they tap the button.

This module keeps the plain-text formatter so the /finish endpoint can still
return a formatted bill string if needed (e.g. for printing or future SMS support).
"""

from typing import List
from schemas import BillItem


def format_bill_text(items: List[BillItem], total: float, store_name: str = "JAYA VILAS", address: str = "Cheran Nagar") -> str:
    """Return a plain-text bill suitable for display or sharing."""
    from datetime import datetime
    date_str = datetime.now().strftime("%d %b %Y  %I:%M %p")

    lines = [
        f"🧾 *{store_name}*",
        address,
        date_str,
        "─────────────────────",
    ]
    for item in items:
        unit_label = f" {item.unit}" if item.unit and item.unit != "piece" else ""
        lines.append(
            f"• {item.product}  {item.qty}{unit_label}  ×  ₹{item.price:.0f}  =  *₹{item.subtotal:.0f}*"
        )
    lines += [
        "─────────────────────",
        f"*TOTAL  ₹{total:.0f}*",
        "─────────────────────",
        "நன்றி! மீண்டும் வாருங்கள் 🙏",
    ]
    return "\n".join(lines)

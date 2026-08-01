"""
Tamil text parser — rule-based for Version 1.
Extracts product name, quantity, and unit from spoken Tamil phrases.
"""

# Tamil number words → numeric value
TAMIL_NUMBERS: dict[str, float] = {
    "ஒரு": 1, "ஒன்று": 1, "ஒண்ணு": 1,
    "இரண்டு": 2, "ரெண்டு": 2,
    "மூன்று": 3, "மூணு": 3,
    "நான்கு": 4, "நாலு": 4,
    "ஐந்து": 5, "ஐஞ்சு": 5,
    "ஆறு": 6,
    "ஏழு": 7,
    "எட்டு": 8,
    "ஒன்பது": 9,
    "பத்து": 10,
    "பதினொன்று": 11,
    "பன்னிரண்டு": 12,
    "பதினைந்து": 15,
    "இருபது": 20,
    "முப்பது": 30,
    "நாற்பது": 40,
    "ஐம்பது": 50,
    "அறுபது": 60,
    "எழுபது": 70,
    "எண்பது": 80,
    "தொண்ணூறு": 90,
    "நூறு": 100,
    # half
    "அரை": 0.5,
    "கால்": 0.25,
}

# Tamil unit words → standard unit label
TAMIL_UNITS: dict[str, str] = {
    "கிலோ": "kg",
    "கிலோகிராம்": "kg",
    "கிராம்": "g",
    "லிட்டர்": "litre",
    "லிட்": "litre",
    "மில்லி": "ml",
    "பாக்கெட்": "packet",
    "பாக்": "packet",
    "டின்": "tin",
    "பீஸ்": "piece",
    "எண்ணிக்கை": "piece",
    "நிறை": "piece",
    "டஜன்": "dozen",
    "பாட்டில்": "bottle",
}

# Common Tamil product name → English display name
PRODUCT_NAMES: dict[str, str] = {
    "அரிசி": "Rice",
    "பால்": "Milk",
    "சர்க்கரை": "Sugar",
    "சக்கரை": "Sugar",
    "உப்பு": "Salt",
    "எண்ணெய்": "Oil",
    "கடலை எண்ணெய்": "Groundnut Oil",
    "தேங்காய் எண்ணெய்": "Coconut Oil",
    "மாவு": "Flour",
    "கோதுமை மாவு": "Wheat Flour",
    "பருப்பு": "Dal",
    "துவரம் பருப்பு": "Toor Dal",
    "கடலை பருப்பு": "Chana Dal",
    "தக்காளி": "Tomato",
    "வெங்காயம்": "Onion",
    "உருளைக்கிழங்கு": "Potato",
    "கேரட்": "Carrot",
    "காய்கறி": "Vegetables",
    "வாழைப்பழம்": "Banana",
    "ஆப்பிள்": "Apple",
    "டீ": "Tea",
    "காபி": "Coffee",
    "சோப்பு": "Soap",
    "சாம்பிராணி": "Detergent",
    "சாப்பாடு": "Food",
}


def _translate_product(word: str) -> str:
    """Return English name if known, else return the Tamil word as-is."""
    return PRODUCT_NAMES.get(word, word)


def parse_tamil_text(text: str) -> dict:
    """
    Parse a Tamil phrase like 'அரிசி இரண்டு கிலோ' into structured data.

    Returns a dict with keys: product, quantity, unit
    Falls back gracefully when words aren't recognised.
    """
    tokens = text.strip().split()

    quantity: float = 1.0
    unit: str = "piece"
    product_tokens: list[str] = []

    i = 0
    while i < len(tokens):
        token = tokens[i]

        # Check for Tamil number word
        if token in TAMIL_NUMBERS:
            quantity = TAMIL_NUMBERS[token]
            i += 1
            continue

        # Check for plain digit (e.g. "2", "2.5")
        try:
            quantity = float(token)
            i += 1
            continue
        except ValueError:
            pass

        # Check for unit word
        if token in TAMIL_UNITS:
            unit = TAMIL_UNITS[token]
            i += 1
            continue

        # Otherwise treat as part of product name
        product_tokens.append(token)
        i += 1

    # Join remaining tokens as the product name
    raw_product = " ".join(product_tokens) if product_tokens else text
    product = _translate_product(raw_product) if len(product_tokens) == 1 else raw_product

    return {
        "product": product,
        "quantity": quantity,
        "unit": unit,
    }

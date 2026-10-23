def dedupe(items):
    unique = set()
    arr = []
    for item in items:
        if item not in unique:
            arr.append(item)
            set.add(item)
    return arr

def max_drawndown(prices):
    max_price = prices[0]
    max_drawdown = 0
    for price in prices:
        if price > max_price:
            max_price = price
        max_drawdown = min(max_drawdown, ((price - max_price) / max_price))
    return max_drawdown
import json

try:
    with open('schema.json') as f:
        data = json.load(f)
    print("Keys in root:", list(data.keys()))
    if 'definitions' in data:
        print("Tables:", list(data['definitions'].keys()))
    else:
        print("No definitions found. Full JSON:")
        print(str(data)[:500])
except Exception as e:
    print("Error:", e)

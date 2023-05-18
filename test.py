import requests

API_URL ='https://api-inference.huggingface.co/models/mattmdjaga/segformer_b2_clothes'


headers = {"Authorization": "Bearer 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"}

def query(filename):
    with open(filename, "rb") as f:
        data = f.read()
    response = requests.post(API_URL, headers=headers, data=data)
    return response.json()

# output = query("/Users/doublefs/Downloads/20230321-214824.jpg")
output = query("/Users/shinyzhang/Desktop/werw.jpg")

print(output)

for item in output:
      print(item.mask)


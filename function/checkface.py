from keras.models import load_model
from PIL import Image, ImageOps
import numpy as np
import urllib.request
from io import BytesIO

def handler(event, context):
    print("event occurs")
    try:
        url = event['data']['imageURL']
        # url = "https://hanbucket-test.s3.ap-northeast-2.amazonaws.com/img.png"
        print(url)
        req = urllib.request.Request(url, headers = {"User-Agent" : "Mozilla/5.0"})
        print(1)
        res = urllib.request.urlopen(req).read()
        print(2)
        image = Image.open(BytesIO(res))

         # keras
        print(3)
        model = load_model('/kubeless/model/keras_model.h5')
        print(4)
        data = np.ndarray(shape=(1, 224, 224, 3), dtype=np.float32)
        print(5)
        size = (224, 224)
        print(6)
        image = ImageOps.fit(image, size, Image.ANTIALIAS)
        print(7)
        image_array = np.asarray(image)
        print(8)
        normalized_image_array = (image_array.astype(np.float32) / 127.0) - 1
        print(9)
        data[0] = normalized_image_array
        print(10)
        prediction = model.predict(data)
        #result
        print("사람:", float(prediction[0][0]))
        print("손바닥:", float(prediction[0][1]))
        return 'ok'
        
    except Exception as e:
        print(e)
        return 'fail'



   
handler(1, 1)


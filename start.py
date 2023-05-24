from flask import Flask
import base64
import os
from flask import request
from flask_cors import CORS
from flask import Flask, jsonify
import subprocess
import json
import re
import asyncio
from create_npy import process_image
import subprocess
import requests

import requests
from waitress import serve
import logging.handlers
from prometheus_flask_exporter import PrometheusMetrics

LOG_FILE = "test_log.log"
log_format = "[%(levelname)s] %(asctime)s [%(filename)s:%(lineno)d, %(funcName)s] %(message)s"
logging.basicConfig(filename=LOG_FILE,
                    filemode="a",
                    format=log_format,
                    level=logging.INFO)
time_hdls = logging.handlers.TimedRotatingFileHandler(
  LOG_FILE, when='D', interval=1, backupCount=7)
logging.getLogger().addHandler(time_hdls)

logging.info("begin service")

DEPLOY_PORT = 8889



API_URL ='https://api-inference.huggingface.co/models/mattmdjaga/segformer_b2_clothes'
Api_Key = 'RLAt4y5ZRKp6ED4FwUhTN6Qg'
        #kw3sctYmvGtQadoBFP6y8waR

headers = {"Authorization": "Bearer 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"}
# logging.info("begin service")
    # 获取前端传递的参数
async def query(filename):
    with open(filename, "rb") as f:
        data = f.read()
    response =  requests.post(API_URL, headers=headers, data=data)
    return response.json()


app = Flask(__name__)
app.config['THREADS_PER_PAGE'] = 6
app.config['PROCESS_PER_CPU'] = 4
metrics = PrometheusMetrics(app)
CORS(app)
request_counter = 0
@app.route('/hugging_delete', methods=['POST'])
def hugging_delete():
    img_path = request.json['img_path']
    # 删除图像文件
    if os.path.exists(img_path):
        os.remove(img_path)
    return jsonify({'status': 'success', 'message': 'Files deleted successfully'})

@app.route('/hugging_face_use_image', methods=['POST'])
async def hugging_face_use_image():
    imgURL = request.json['imgURL']
    output = await  query(imgURL)
  # --output 
    return jsonify({'data':output})

@app.route('/api/hugging_files', methods=['GET'])
def hugging_files():
    image_path = 'demo/src/assets/hugging'
    image_paths = []
    for root, dirs, files in os.walk(image_path):
        for filename in files:
            # 判断是否为图片文件
            if filename.endswith('.jpg') or filename.endswith('.png') or filename.endswith('.jpeg'):
                image_path = os.path.join(root, filename)
                image_paths.append(image_path)
        return {'image_paths': image_paths}
    

@app.route('/hugging_face_save_image', methods=['POST'])
async def hugging_face_save_image():
    imgData = request.json['imgData']
    imgName = request.json['imgName']
    # 将base64格式的图片内容解码为bytes
    img_bytes = base64.b64decode(imgData)
    # 确定图片保存的文件路径
    save_path = os.path.join('demo', 'src', 'assets', 'hugging', imgName)
    # 将图片保存到磁盘
    with open(save_path, 'wb') as f:
        f.write(img_bytes)
    print(save_path,'保存成功')
    output = await  query(save_path)
    
  # --output 
    return jsonify({'data':output})
  
@app.route('/delete', methods=['POST'])
def delete_files():
    name = request.json['name']
    # 删除图像文件
    img_path = os.path.join('demo', 'src', 'assets', 'data', f'{name}.jpg')
    if os.path.exists(img_path):
        os.remove(img_path)
    img_path = os.path.join('demo', 'src', 'assets', 'data', f'{name}.png')
    if os.path.exists(img_path):
        os.remove(img_path)
    img_path = os.path.join('demo', 'src', 'assets', 'data', f'{name}.jpeg')
    if os.path.exists(img_path):
        os.remove(img_path)
    # 删除.np文件
    npy_path = os.path.join('demo', 'src', 'assets', 'data', f'{name}_embedding.npy')
    if os.path.exists(npy_path):
        os.remove(npy_path)
    # 删除.onnx文件
    onnx_path = os.path.join('demo', 'model', f'sam_{name}_onnx_quantized_example.onnx')
    if os.path.exists(onnx_path):
        os.remove(onnx_path)
    return jsonify({'status': 'success', 'message': 'Files deleted successfully'})

@app.route('/save_image', methods=['POST'])
async def save_image():
    # 获取前端传递的参数
    global request_counter
    if request_counter > 0:
         return jsonify({ 'code':-1,'status': 'error', 'message': '有用户在使用稍后再上传','data':{} })
    request_counter += 1
    # Untitled API Key (2023-05-22 21:24:44)
    # kw3sctYmvGtQadoBFP6y8waR
    try:
        imgData = request.json['imgData']
        imgName = request.json['imgName']
        # 将base64格式的图片内容解码为bytes
        imgName = re.sub(r'\.(png|jpeg|gif|bmp|tiff)$', '.jpg', imgName)
        # img_bytes = base64.b64decode(imgData)
        # 确定图片保存的文件路径
        save_path = os.path.join('demo', 'src', 'assets', 'data', imgName)
        new_filename = re.sub(r'\.\w+$', '', imgName)
        # 将图片保存到磁盘
        # with open(save_path, 'wb') as f:
        #     f.write(img_bytes)
        # print(imgName,'保存成功')
        # print(imgName,'处理背景图片')
      
        response =  requests.post(
            'https://api.remove.bg/v1.0/removebg',
            # files={'image_file': open(save_path, 'rb')},
            data={
                "image_file_b64": imgData,
                'size': 'full',#"auto", "preview", "small", "regular", "medium", "hd", "full", "4k"
                'type': 'auto',#"auto", "person", "product", "animal", "car", "car_interior", "car_part", "transportation", "graphics", "other"
                'type_level': '1',#["none", "latest", "1", "2"]:
                'format': "jpg",#["jpg", "zip", "png", "auto"]:
                # 'roi': "rgba", #["rgba", "alpha"]:
                'crop': True , #true  false
                'crop_margin': None,
                'scale': 'original'  ,#'original'  
                'position': 'original'  , #'original'
                'channels': 'rgba',#'rgba'  alpha
                'add_shadow': True, #true  false
                'semitransparency': True #true  false
                },
            headers={'X-Api-Key': Api_Key},
        )
        if response.status_code == requests.codes.ok:
             with open(save_path, 'wb') as f:
                  f.write(response.content)
                  print(imgName,'保存成功')
                  print(imgName,'处理背景图片')
        else:
            print("Error:", response.status_code, response.text)

        print('npy生成中 ....')
        # 返回保存成功的信息
        await process_image('demo/src/assets/data/'+imgName, 'demo/src/assets/data/'+new_filename+'_embedding.npy')
        print('npy生成成功')
        print('onnx生成中 ....')
        command = 'python scripts/export_onnx_model.py --checkpoint sam_vit_h_4b8939.pth --model-type vit_h --output ./demo/model/sam_'+new_filename+'_onnx_quantized_example.onnx'
        process = subprocess.Popen(command.split(), stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        output, error = process.communicate()
        print('onnx生成中完成')

        if process.returncode != 0:
            print(f"出错了：{error.decode('utf-8')}")
        else:
            print(f"命令执行完毕：{output.decode('utf-8')}")
      # --output 
        return jsonify({'status': 'success', 'message': 'Image saved successfully','data':{
                'imgURL':'/assets/data/'+imgName,
                'npyURL':'/assets/data/'+new_filename+'_embedding.npy',
                'onnxURL':'/model/sam_'+new_filename+'_onnx_quantized_example.onnx'
            }})
    finally:
            request_counter -= 1
           
@app.route('/api/files')
def get_onnx_files():
    onnx_path = 'demo/model'  # 指定文件夹路径
    onnx_paths = []
    npy_path = 'demo/src/assets/data'  # 指定文件夹路径
    npy_paths = []
    image_path = 'demo/src/assets/data'
    image_paths = []
    for root, dirs, files in os.walk(onnx_path):
        for filename in files:
        # 判断是否为图片文件
          if filename.endswith('.onnx'):
              onnx_path = os.path.join(root, filename)
              onnx_paths.append(onnx_path)

    for root, dirs, files in os.walk(npy_path):
        for filename in files:
        # 判断是否为图片文件
          if filename.endswith('.npy'):
              npy_path = os.path.join(root, filename)
              npy_paths.append(npy_path)

    for root, dirs, files in os.walk(image_path):
        for filename in files:
            # 判断是否为图片文件
            if filename.endswith('.jpg') or filename.endswith('.png') or filename.endswith('.jpeg'):
                image_path = os.path.join(root, filename)
                image_paths.append(image_path)
        return {'onnx_paths': onnx_paths,'npy_paths': npy_paths,'image_paths': image_paths}
      
@app.route('/')
def ok():
    return {'status': 'ok'}
@app.route('/api/img_folder')
def traverse_folder():
    folder_path = 'demo/src/assets/data'
    image_paths = []
    for root, dirs, files in os.walk(folder_path):
        for filename in files:
            # 判断是否为图片文件
            if filename.endswith('.jpg') or filename.endswith('.png') or filename.endswith('.jpeg'):
                image_path = os.path.join(root, filename)
                image_paths.append(image_path)
    return {'image_paths': image_paths}

if __name__ == '__main__':
    
    app.run(debug=True, port=5000, host='0.0.0.0')
    # logging.info("process_is_alive_noneed_begin")
    # serve(app, host='0.0.0.0', port=5000, threads=30)  # WAITRESS!
    # logging.info("try check and start app, end")



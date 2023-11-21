from flask import Flask, send_file
import base64
import os
import shutil
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
import io
from PIL import Image
import types
from utils.compressImg import compress_image

from Grounded_Segment_Anything.grounded_sam import grounded_sam, unzip_file, zip_folder

maskApiTask = types.SimpleNamespace(
  done=False,
)




LOG_FILE = "test_log.log"
log_format = "[%(levelname)s] %(asctime)s [%(filename)s:%(lineno)d, %(funcName)s] %(message)s"
# logging.basicConfig(filename=LOG_FILE,
#                     filemode="a",
#                     format=log_format,
#                     level=logging.INFO)
# time_hdls = logging.handlers.TimedRotatingFileHandler(
#   LOG_FILE, when='D', interval=1, backupCount=7)
# logging.getLogger().addHandler(time_hdls)

# logging.info("begin service")

DEPLOY_PORT = 8889


API_URL ='https://api-inference.huggingface.co/models/mattmdjaga/segformer_b2_clothes'
Api_Key = 'ZhMKdUcQXpAqNGmh3rHV5amz'
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
    small_img_path = os.path.join('demo', 'src', 'assets', 'compressed_data', f'{name}.jpg')
    if os.path.exists(small_img_path):
        os.remove(small_img_path)
    small_img_path = os.path.join('demo', 'src', 'assets', 'compressed_data', f'{name}.png')
    if os.path.exists(small_img_path):
        os.remove(img_path)
    small_img_path = os.path.join('demo', 'src', 'assets', 'compressed_data', f'{name}.jpeg')
    if os.path.exists(small_img_path):
        os.remove(small_img_path)    
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
    if  maskApiTask.done == True :
         return jsonify({ 'code':-1,'status': 'error', 'message': '有用户在使用稍后再上传','data':{} })
    
    # Untitled API Key (2023-05-22 21:24:44)
    # kw3sctYmvGtQadoBFP6y8waR
    try:
        maskApiTask.done == False
        imgData = request.json['imgData']
        imgName = request.json['imgName']
        # 将base64格式的图片内容解码为bytes
        imgName = re.sub(r'\.(png|jpeg|gif|bmp|tiff|jpg|webp)$', '.png', imgName)
        img_bytes = base64.b64decode(imgData)
        # 确定图片保存的文件路径
        save_path = os.path.join('demo', 'src', 'assets', 'data', imgName)
        new_filename = re.sub(r'\.\w+$', '', imgName)
        # 将图片保存到磁盘
        with open(save_path, 'wb') as f:
            f.write(img_bytes)
        print(imgName,'保存成功')
        
        # 从图像文件中读取字节流
        # print(save_path,'处理背景图片')
        #948e06275c5101f62bb5931c9d189f40d3da77d993b3005f49e09782d335687619dee798ea5ea07d4c89d00180e4eaa1
        
        # with open(save_path, 'rb') as f:
        #     image_data = f.read()
        # # 创建 BytesIO 对象
        # image_file_object = io.BytesIO(image_data)
        # # 将 BytesIO 对象重置到初始位置
        # image_file_object.seek(0)
        # files = {
        #     'image_file': (save_path, image_file_object, 'image/jpeg'),
        # }
        # # 发送 POST 请求
        # r = requests.post('https://clipdrop-api.co/remove-background/v1',
        #                   files=files,
        #                   headers={
        #                     #  'Accept': 'image/jpeg',
        #                     'x-api-key': '7dcd5171ffc0fcd3749f56a2e0f301f4ff671138504fc3ff8fb6a0d7f60cd5edde20c8433705e5d485e93549d5d3590f'})
        # print(r.headers)
        # if (r.ok):
        #   with open(save_path, 'wb') as f:
        #     f.write(r.content)
        # else:
        #     r.raise_for_status()

        # image = Image.open(save_path)
        # # 创建一个新的 RGBA 图像，尺寸与原始图片相同，背景色为白色
        # background = Image.new('RGBA', image.size, (239, 239, 239))
        # # 将原始图片粘贴到新的背景图像上
        # background.paste(image, (0, 0), image)
        # 保存带有白色背景的图片
        # background.save(save_path)
        # print(save_path,'处理背景图片成功')
      
        output_directory = 'demo/src/assets/compressed_data/'+'small_'+imgName
        max_width = 400
        max_height = 400*1.16
        compress_image(save_path, output_directory, max_width, max_height)

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
        maskApiTask.done = False           
        return jsonify({'status': 'success', 'message': 'Image saved successfully','data':{
                'compressedOImgURL':'/assets/compressed_data/small_'+imgName,
                'imgURL':'/assets/data/'+imgName,
                'npyURL':'/assets/data/'+new_filename+'_embedding.npy',
                'onnxURL':'/model/sam_'+new_filename+'_onnx_quantized_example.onnx'
            }})
    finally:
      maskApiTask.done = False                    
@app.route('/api/files')
def get_onnx_files():
    onnx_path = 'demo/model'  # 指定文件夹路径
    onnx_paths = []
    npy_path = 'demo/src/assets/data'  # 指定文件夹路径
    npy_paths = []
    image_path = 'demo/src/assets/data'
    image_paths = []
    compressedOImgURLs=[]
    compressedOImgURL ='demo/src/assets/compressed_data'
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
                compressedOImgURL= os.path.join('demo/src/assets/compressed_data','small_'+filename)
                image_paths.append(image_path)
                compressedOImgURLs.append(compressedOImgURL)
        return {'onnx_paths': onnx_paths,
                'npy_paths': npy_paths,
                'image_paths': image_paths,                
                'compressedOImgURL_paths':compressedOImgURLs,
                }
      
@app.route('/')
def ok():
    print('status Ok')
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

@app.route('/grounded', methods=['POST'])
async def grounded():
    directory = "Grounded_Segment_Anything/uploads"
    file = request.json['file']
    file_name = request.json['fileName']
    save_path = os.path.join(directory, file_name)
    # 将图片保存到磁盘
    with open(save_path, 'wb') as f:
        f.write(base64.b64decode(file))
    # 解压
    await unzip_file(save_path, directory)
    # 生成mask
    folder_name = file_name.split(".")[0]
    folder = os.path.join(directory, folder_name)
    output_dir = os.path.join("Grounded_Segment_Anything/outputs", folder_name)
    for child_file_name in os.listdir(folder):
        if not ".DS_Store" in child_file_name:
            config_file = "Grounded_Segment_Anything/GroundingDINO/groundingdino/config/GroundingDINO_SwinB_cfg.py"
            grounded_checkpoint = "Grounded_Segment_Anything/groundingdino_swinb_cogcoor.pth"
            sam_checkpoint = "sam_vit_h_4b8939.pth"
            image_path = os.path.join(folder, child_file_name)
            text_prompt = request.json['text_prompt']
            output_dir = output_dir
            box_threshold = request.json['box_threshold']
            text_threshold = request.json['text_threshold']
            print(child_file_name, "正在生成")
            await grounded_sam(
                config_file, 
                grounded_checkpoint, 
                sam_checkpoint, 
                image_path, 
                text_prompt, 
                output_dir, 
                box_threshold, 
                text_threshold,
                child_file_name.split(".")[0]
            )
            print(child_file_name, "生成成功")

    zip_folder(output_dir, output_dir + '.zip')
    os.remove(folder+'.zip')
    shutil.rmtree(folder)
    return jsonify({'status': 'success', 'message': 'successfully'})

@app.route('/getFolderList')
def get_folder_list():
    folderList = os.listdir("Grounded_Segment_Anything/outputs")
    zip_file_list = [file for file in folderList if file.endswith(".zip")]

    return jsonify({'status': 'success', 'message': 'successfully', "data": zip_file_list})

@app.route('/downloadFile')
def download_file():
    file_name = request.args.get('fileName')
    output_path = "Grounded_Segment_Anything/outputs"
    folder_path = os.path.join(output_path, file_name)
    return send_file(folder_path)
    


if __name__ == '__main__':
    
    # app.run(debug=True, port=5000, host='0.0.0.0')
    # logging.info("process_is_alive_noneed_begin")
    serve(app, host='0.0.0.0', port=5000, threads=30)  # WAITRESS!
    # logging.info("try check and start app, end")



# Requires "requests" to be installed (see python-requests.org)
# import requests
# import os

# img_file_path（图片文件路径）：源图片文件的路径。

# size（尺寸）：输出图像的大小（'auto'表示最高可用分辨率，'preview'表示预览）。

# type（前景对象类型）：前景对象的类型（'auto'表示自动检测，'person'表示人物，'product'表示产品，'car'表示汽车）。

# type_level（前景对象分类级别）：前景对象的分类级别（'none'表示无分类，'1'表示粗略分类（例如'car'），'2'表示具体分类（例如'car_interior'），'latest'表示最新分类）。

# format（图像格式）：图像的格式（'auto'表示自动检测，'png'表示PNG格式，'jpg'表示JPG格式，'zip'表示压缩文件）。

# roi（感兴趣区域）：在哪个区域寻找前景对象的感兴趣区域（x1，y1，x2，y2）以像素或相对百分比表示。

# crop（裁剪）：裁剪的大小（像素或相对百分比），单个值表示所有边，两个值表示上/下，左/右，四个值表示上、右、下、左。

# scale（缩放）：图像相对于总图像尺寸的缩放比例。

# position（位置）：图像的位置（'center'表示居中，'original'表示原始位置，单个值表示水平和垂直方向，两个值表示水平和垂直方向）。

# channels（通道）：请求最终图像（'rgba'）或alpha遮罩（'alpha'）。

# shadow（阴影）：是否添加人工阴影（某些类型不支持）。

# semitransparency（半透明）：窗户或玻璃物体的半透明效果（某些类型不支持）。

# bg（背景）：背景（None表示无背景，路径、URL、颜色十六进制代码（例如'81d4fa'、'fff'），颜色名称（例如'green'））。

# bg_type（背景类型）：背景类型（None表示无背景，'path'表示路径，'url'表示URL，'color'表示颜色）。

# new_file_name（新文件名）：结果图像的文件名。






# save_path = os.path.join('demo', 'src', 'assets', 'data', '5.17.1.jpg')
# response = requests.post(
#     'https://api.remove.bg/v1.0/removebg',
#     files={'image_file': open(save_path, 'rb')},
#     data={
#         "image_file_b64": "",
#         'size': 'auto',
#         "format": "png",
#         'size': 'full',#"auto", "preview", "small", "regular", "medium", "hd", "full", "4k"
#         'type': 'auto',#"auto", "person", "product", "animal", "car", "car_interior", "car_part", "transportation", "graphics", "other"
#         'type_level': '1',#["none", "latest", "1", "2"]:
#         'format': "jpg",#["jpg", "zip", "png", "auto"]:
#         # 'roi': "rgba", #["rgba", "alpha"]:
#         'crop': True , #true  false
#         'crop_margin': None,
#         'scale': 'original'  ,#'original'  
#         'position': 'original'  , #'original'
#         'channels': 'rgba',#'rgba'  alpha
#         'add_shadow': True, #true  false
#         'semitransparency': True #true  false
#         },
#     headers={'X-Api-Key': 'RLAt4y5ZRKp6ED4FwUhTN6Qg'},
# )#RLAt4y5ZRKp6ED4FwUhTN6Qg
# #kw3sctYmvGtQadoBFP6y8waR
# if response.status_code == requests.codes.ok:
#     with open('no-bg.png', 'wb') as out:
#         out.write(response.content)
# else:
#     print("Error:", response.status_code, response.text)

# from rembg import remove
# import cv2

# input_path = 'input.png'
# output_path = 'output.jpg'

# input = cv2.imread(input_path)
# output = remove(input)
# cv2.imwrite(output_path, output)

# from rembg import remove

# input_path = 'input.jpeg'
# output_path = 'output.jpeg'

# with open(input_path, 'rb') as i:
#     with open(output_path, 'wb') as o:
#         input = i.read()
#         output = remove(input)
#         o.write(output)


# import requests
# import io
# import json
# from PIL import Image

# image = Image.open('cat-1.png')


# # 创建一个新的 RGBA 图像，尺寸与原始图片相同，背景色为白色
# background = Image.new('RGBA', image.size, (255, 255, 255))

# # 将原始图片粘贴到新的背景图像上
# background.paste(image, (0, 0), image)

# # 保存带有白色背景的图片
# background.save('output.png')

# 保存带有白色背景的图片


# image_path = '20230526-171107.jpg'
# # 从图像文件中读取字节流
# with open(image_path, 'rb') as f:
#     image_data = f.read()

# # 创建 BytesIO 对象
# image_file_object = io.BytesIO(image_data)

# # 将 BytesIO 对象重置到初始位置
# image_file_object.seek(0)

# # 构建请求的数据
# files = {
#     'image_file': (image_path, image_file_object, 'image/jpeg'),
# }

# # 发送 POST 请求
# r = requests.post('https://clipdrop-api.co/remove-background/v1',
#                   files=files,
#                   headers={
#                     #  'Accept': 'image/jpeg',
#                      'x-api-key': '91704e981147fe58c8e0df5662d7d1ba18bfc11c18ff85a0000ec61aaea575565d543e3a2450b872245630c387ea83a4'})

# print(r.headers)
# if (r.ok):
#   with open(image_path, 'wb') as f:
#     f.write(r.content)
# else:
#   r.raise_for_status()


# image_path = 'WechatIMG310.png'
# # 从图像文件中读取字节流
# with open(image_path, 'rb') as f:
#     image_data = f.read()

# # 创建 BytesIO 对象
# image_file_object = io.BytesIO(image_data)

# # 将 BytesIO 对象重置到初始位置
# image_file_object.seek(0)
# # 高清
# r = requests.post('https://clipdrop-api.co/super-resolution/v1',
#   files = {
#     'image_file': (image_path, image_file_object, 'image/jpeg'),
#     },
#   data = { 'upscale': 4 },
#   headers = { 'x-api-key': '91704e981147fe58c8e0df5662d7d1ba18bfc11c18ff85a0000ec61aaea575565d543e3a2450b872245630c387ea83a4'}
# )
# if (r.ok):
#   with open('WechatIMG310-1.jpeg', 'wb') as f:
#     f.write(r.content)
# else:
#   r.raise_for_status()

## 去文字

# image_path = 'testImg/md.jpg'
# # 从图像文件中读取字节流
# with open(image_path, 'rb') as f:
#     image_data = f.read()

# # 创建 BytesIO 对象
# image_file_object = io.BytesIO(image_data)

# # 将 BytesIO 对象重置到初始位置
# image_file_object.seek(0)

# r = requests.post('https://clipdrop-api.co/remove-text/v1',
#   files = {
#     'image_file': ('image.jpg', image_file_object, 'image/jpeg')
#     },
#   headers = { 'x-api-key': '91704e981147fe58c8e0df5662d7d1ba18bfc11c18ff85a0000ec61aaea575565d543e3a2450b872245630c387ea83a4'}
# )

# if (r.ok):
#     with open('output.jpeg', 'wb') as f:
#      f.write(r.content)
# else:
  # r.raise_for_status()

# Requires "requests" to be installed (see python-requests.org)
# import requests
# import os

# img_file_path（图片文件路径）：源图片文件的路径。

# size（尺寸）：输出图像的大小（'auto'表示最高可用分辨率，'preview'表示预览）。

# type（前景对象类型）：前景对象的类型（'auto'表示自动检测，'person'表示人物，'product'表示产品，'car'表示汽车）。

# type_level（前景对象分类级别）：前景对象的分类级别（'none'表示无分类，'1'表示粗略分类（例如'car'），'2'表示具体分类（例如'car_interior'），'latest'表示最新分类）。

# format（图像格式）：图像的格式（'auto'表示自动检测，'png'表示PNG格式，'jpg'表示JPG格式，'zip'表示压缩文件）。

# roi（感兴趣区域）：在哪个区域寻找前景对象的感兴趣区域（x1，y1，x2，y2）以像素或相对百分比表示。

# crop（裁剪）：裁剪的大小（像素或相对百分比），单个值表示所有边，两个值表示上/下，左/右，四个值表示上、右、下、左。

# scale（缩放）：图像相对于总图像尺寸的缩放比例。

# position（位置）：图像的位置（'center'表示居中，'original'表示原始位置，单个值表示水平和垂直方向，两个值表示水平和垂直方向）。

# channels（通道）：请求最终图像（'rgba'）或alpha遮罩（'alpha'）。

# shadow（阴影）：是否添加人工阴影（某些类型不支持）。

# semitransparency（半透明）：窗户或玻璃物体的半透明效果（某些类型不支持）。

# bg（背景）：背景（None表示无背景，路径、URL、颜色十六进制代码（例如'81d4fa'、'fff'），颜色名称（例如'green'））。

# bg_type（背景类型）：背景类型（None表示无背景，'path'表示路径，'url'表示URL，'color'表示颜色）。

# new_file_name（新文件名）：结果图像的文件名。






# save_path = os.path.join('demo', 'src', 'assets', 'data', '5.17.1.jpg')
# response = requests.post(
#     'https://api.remove.bg/v1.0/removebg',
#     files={'image_file': open(save_path, 'rb')},
#     data={
#         "image_file_b64": "",
#         'size': 'auto',
#         "format": "png",
#         'size': 'full',#"auto", "preview", "small", "regular", "medium", "hd", "full", "4k"
#         'type': 'auto',#"auto", "person", "product", "animal", "car", "car_interior", "car_part", "transportation", "graphics", "other"
#         'type_level': '1',#["none", "latest", "1", "2"]:
#         'format': "jpg",#["jpg", "zip", "png", "auto"]:
#         # 'roi': "rgba", #["rgba", "alpha"]:
#         'crop': True , #true  false
#         'crop_margin': None,
#         'scale': 'original'  ,#'original'  
#         'position': 'original'  , #'original'
#         'channels': 'rgba',#'rgba'  alpha
#         'add_shadow': True, #true  false
#         'semitransparency': True #true  false
#         },
#     headers={'X-Api-Key': 'RLAt4y5ZRKp6ED4FwUhTN6Qg'},
# )#RLAt4y5ZRKp6ED4FwUhTN6Qg
# #kw3sctYmvGtQadoBFP6y8waR
# if response.status_code == requests.codes.ok:
#     with open('no-bg.png', 'wb') as out:
#         out.write(response.content)
# else:
#     print("Error:", response.status_code, response.text)

# from rembg import remove
# import cv2

# input_path = 'input.png'
# output_path = 'output.jpg'

# input = cv2.imread(input_path)
# output = remove(input)
# cv2.imwrite(output_path, output)

# from rembg import remove

# input_path = 'input.jpeg'
# output_path = 'output.jpeg'

# with open(input_path, 'rb') as i:
#     with open(output_path, 'wb') as o:
#         input = i.read()
#         output = remove(input)
#         o.write(output)


# import requests
# import io
# import json
# from PIL import Image

# image = Image.open('cat-1.png')


# # 创建一个新的 RGBA 图像，尺寸与原始图片相同，背景色为白色
# background = Image.new('RGBA', image.size, (255, 255, 255))

# # 将原始图片粘贴到新的背景图像上
# background.paste(image, (0, 0), image)

# # 保存带有白色背景的图片
# background.save('output.png')

#----------------------

# 保存带有白色背景的图片


# image_path = '20230526-171107.jpg'
# # 从图像文件中读取字节流
# with open(image_path, 'rb') as f:
#     image_data = f.read()

# # 创建 BytesIO 对象
# image_file_object = io.BytesIO(image_data)

# # 将 BytesIO 对象重置到初始位置
# image_file_object.seek(0)

# # 构建请求的数据
# files = {
#     'image_file': (image_path, image_file_object, 'image/jpeg'),
# }

# # 发送 POST 请求
# r = requests.post('https://clipdrop-api.co/remove-background/v1',
#                   files=files,
#                   headers={
#                     #  'Accept': 'image/jpeg',
#                      'x-api-key': '91704e981147fe58c8e0df5662d7d1ba18bfc11c18ff85a0000ec61aaea575565d543e3a2450b872245630c387ea83a4'})

# print(r.headers)
# if (r.ok):
#   with open(image_path, 'wb') as f:
#     f.write(r.content)
# else:
#   r.raise_for_status()


# image_path = 'WechatIMG310.png'
# # 从图像文件中读取字节流
# with open(image_path, 'rb') as f:
#     image_data = f.read()

# # 创建 BytesIO 对象
# image_file_object = io.BytesIO(image_data)

# # 将 BytesIO 对象重置到初始位置
# image_file_object.seek(0)
# # 高清
# r = requests.post('https://clipdrop-api.co/super-resolution/v1',
#   files = {
#     'image_file': (image_path, image_file_object, 'image/jpeg'),
#     },
#   data = { 'upscale': 4 },
#   headers = { 'x-api-key': '91704e981147fe58c8e0df5662d7d1ba18bfc11c18ff85a0000ec61aaea575565d543e3a2450b872245630c387ea83a4'}
# )
# if (r.ok):
#   with open('WechatIMG310-1.jpeg', 'wb') as f:
#     f.write(r.content)
# else:
#   r.raise_for_status()

## 去文字

# image_path = 'testImg/md.jpg'
# # 从图像文件中读取字节流
# with open(image_path, 'rb') as f:
#     image_data = f.read()

# # 创建 BytesIO 对象
# image_file_object = io.BytesIO(image_data)

# # 将 BytesIO 对象重置到初始位置
# image_file_object.seek(0)

# r = requests.post('https://clipdrop-api.co/remove-text/v1',
#   files = {
#     'image_file': ('image.jpg', image_file_object, 'image/jpeg')
#     },
#   headers = { 'x-api-key': '91704e981147fe58c8e0df5662d7d1ba18bfc11c18ff85a0000ec61aaea575565d543e3a2450b872245630c387ea83a4'}
# )

# if (r.ok):
#     with open('output.jpeg', 'wb') as f:
#      f.write(r.content)
# else:
  # r.raise_for_status()


 

import requests
import io

 
image_path = 'test.jpg'
# 从图像文件中读取字节流
with open(image_path, 'rb') as f:
    image_data = f.read()

# 创建 BytesIO 对象
image_file_object = io.BytesIO(image_data)

# 将 BytesIO 对象重置到初始位置
image_file_object.seek(0)
r = requests.post('https://clipdrop-api.co/super-resolution/v1',
  files = {
    'image_file': ('car.jpg', image_file_object, 'image/jpeg'),
    },
  data = { 'upscale': 4 },
  headers = { 'x-api-key': '91704e981147fe58c8e0df5662d7d1ba18bfc11c18ff85a0000ec61aaea575565d543e3a2450b872245630c387ea83a4'}
)
if (r.ok):
  with open('output.jpeg', 'wb') as f:
    f.write(r.content)
else:
  r.raise_for_status()
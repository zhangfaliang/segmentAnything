import os
from PIL import Image

def convert_and_compress_images(folder_path):
    # 检查文件夹是否存在
    if not os.path.isdir(folder_path):
        print("文件夹不存在！")
        return
    
    # 遍历文件夹中的文件
    for file_name in os.listdir(folder_path):
        file_path = os.path.join(folder_path, file_name)
        
        # 检查文件是否为.CR2格式
        if file_name.endswith(".CR2"):
            # 修改文件格式为.jpg
            new_file_path = os.path.splitext(file_path)[0] + ".jpg"
            try:
                with Image.open(file_path) as image:
                    # 压缩图片
                    image.save(new_file_path, quality=100)
                    print(f"已转换和压缩文件：{file_name}")
                    
                    # 删除原始的.CR2文件
                    os.remove(file_path)
            except Exception as e:
                print(f"转换和压缩文件时出错：{file_name}")
                print(e)

# 调用函数并传入文件夹路径
folder_path = "processImg/"
convert_and_compress_images(folder_path)


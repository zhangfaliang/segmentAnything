from PIL import Image
import os

# def compress_image(input_path, output_path, max_width, max_height):
#     # 打开图片
#     image = Image.open(input_path)
    
#     # 获取原始宽度和高度
#     width, height = image.size
    
#     # 计算压缩比例
#     ratio = min(max_width / width, max_height / height)
    
#     # 计算压缩后的新宽度和高度
#     new_width = int(width * ratio)
#     new_height = int(height * ratio)
    
#     # 使用ANTIALIAS算法进行图片缩放
#     resized_image = image.resize((new_width, new_height), Image.ANTIALIAS)
    
#     # 保存压缩后的图片
#     resized_image.save(output_path)


def compress_images_in_directory(directory, output_directory, max_width, max_height):
    # 检查输出目录是否存在，如果不存在则创建
    if not os.path.exists(output_directory):
        os.makedirs(output_directory)

    # 遍历目录下的所有文件
    for filename in os.listdir(directory):
        # 拼接文件路径
        input_path = os.path.join(directory, filename)
        output_path = os.path.join(output_directory, 'small_'+filename)

        # 检查文件是否为图片
        if not os.path.isfile(input_path) or not any(input_path.endswith(extension) for extension in ['.jpg', '.jpeg', '.png']):
            continue

        # 打开图片
        image = Image.open(input_path)

        # 获取原始宽度和高度
        width, height = image.size

        # 计算压缩比例
        ratio = min(max_width / width, max_height / height)

        # 计算压缩后的新宽度和高度
        new_width = int(width * ratio)
        new_height = int(height * ratio)

        # 使用ANTIALIAS算法进行图片缩放
        resized_image = image.resize((new_width, new_height), Image.ANTIALIAS)

        # 保存压缩后的图片
        resized_image.save(output_path)


       

def compress_image(save_path, output_path, max_width, max_height):
    image = Image.open(save_path)
    # 获取原始宽度和高度
    width, height = image.size
      # 获取原始宽度和高度
    width, height = image.size
      # 计算压缩比例
    ratio = min(max_width / width, max_height / height)
      # 计算压缩后的新宽度和高度
    new_width = int(width * ratio)
    new_height = int(height * ratio)
    # 使用ANTIALIAS算法进行图片缩放
    resized_image = image.resize((new_width, new_height), Image.ANTIALIAS)
    print(output_path,'output_pathoutput_pathoutput_path')
    # 保存压缩后的图片
    resized_image.save(output_path)

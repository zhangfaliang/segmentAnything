from PIL import Image
import os

def crop_and_resize_images(folder_path, target_size):
    # 遍历文件夹中的所有图片文件
    for filename in os.listdir(folder_path):
        if filename.endswith(".jpg"):
            # 打开图片
            image_path = os.path.join(folder_path, filename)
            image = Image.open(image_path)

            # 裁剪图片并保持纵横比
            width, height = image.size
            aspect_ratio = target_size[0] / target_size[1]
            if width / height > aspect_ratio:
                new_width = int(height * aspect_ratio)
                left = (width - new_width) // 2
                right = left + new_width
                top = 0
                bottom = height
            else:
                new_height = int(width / aspect_ratio)
                top = (height - new_height) // 2
                bottom = top + new_height
                left = 0
                right = width
            image = image.crop((left, top, right, bottom))

            # 调整图片尺寸并保存
            image = image.resize(target_size, Image.ANTIALIAS)
            output_filename = os.path.splitext(filename)[0] + "_resized.jpg"
            output_path = os.path.join(folder_path, output_filename)
            image.save(output_path)

            print(f"图片 {filename} 处理完成")

# 示例使用
folder_path = "processImgCode/corpImg"  # 替换为实际的文件夹路径
target_size = (768, 1024)  # 指定目标尺寸
crop_and_resize_images(folder_path, target_size)

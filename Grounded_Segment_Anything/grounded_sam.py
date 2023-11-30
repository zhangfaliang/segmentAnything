import zipfile
# import argparse
import os
import shutil
import copy

import numpy as np
# import json
import torch
from PIL import Image, ImageDraw, ImageFont
from scipy.ndimage import binary_dilation

# Grounding DINO
import Grounded_Segment_Anything.GroundingDINO.groundingdino.datasets.transforms as T
from Grounded_Segment_Anything.GroundingDINO.groundingdino.models import build_model
from Grounded_Segment_Anything.GroundingDINO.groundingdino.util import box_ops
from Grounded_Segment_Anything.GroundingDINO.groundingdino.util.slconfig import SLConfig
from Grounded_Segment_Anything.GroundingDINO.groundingdino.util.utils import clean_state_dict, get_phrases_from_posmap

# segment anything
from Grounded_Segment_Anything.segment_anything.segment_anything import build_sam, SamPredictor 
import cv2
import matplotlib.pyplot as plt

def load_image(image_path):
    # load image
    image_pil = Image.open(image_path).convert("RGB")  # load image

    transform = T.Compose(
        [
            T.RandomResize([800], max_size=1333),
            T.ToTensor(),
            T.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
        ]
    )
    image, _ = transform(image_pil, None)  # 3, h, w
    return image_pil, image


def load_model(model_config_path, model_checkpoint_path, device):
    args = SLConfig.fromfile(model_config_path)
    args.device = device
    model = build_model(args)
    checkpoint = torch.load(model_checkpoint_path, map_location="cpu")
    load_res = model.load_state_dict(clean_state_dict(checkpoint["model"]), strict=False)
    print(load_res)
    _ = model.eval()
    return model

def dilate_mask(mask, dilation_amt):
    x, y = np.meshgrid(np.arange(dilation_amt), np.arange(dilation_amt))
    center = dilation_amt // 2
    dilation_kernel = ((x - center)**2 + (y - center)**2 <= center**2).astype(np.uint8)
    dilated_binary_img = binary_dilation(mask, dilation_kernel)
    dilated_mask = Image.fromarray(dilated_binary_img.astype(np.uint8) * 255)
    return dilated_mask

def get_grounding_output(model, image, caption, box_threshold, text_threshold, with_logits=True, device="cpu"):
    caption = caption.lower()
    caption = caption.strip()
    if not caption.endswith("."):
        caption = caption + "."
    model = model.to(device)
    image = image.to(device)
    with torch.no_grad():
        outputs = model(image[None], captions=[caption])
    logits = outputs["pred_logits"].cpu().sigmoid()[0]  # (nq, 256)
    boxes = outputs["pred_boxes"].cpu()[0]  # (nq, 4)
    logits.shape[0]

    # filter output
    logits_filt = logits.clone()
    boxes_filt = boxes.clone()
    filt_mask = logits_filt.max(dim=1)[0] > box_threshold
    logits_filt = logits_filt[filt_mask]  # num_filt, 256
    boxes_filt = boxes_filt[filt_mask]  # num_filt, 4
    logits_filt.shape[0]

    # get phrase
    tokenlizer = model.tokenizer
    tokenized = tokenlizer(caption)
    # build pred
    pred_phrases = []
    for logit, box in zip(logits_filt, boxes_filt):
        pred_phrase = get_phrases_from_posmap(logit > text_threshold, tokenized, tokenlizer)
        if with_logits:
            pred_phrases.append(pred_phrase + f"({str(logit.max().item())[:4]})")
        else:
            pred_phrases.append(pred_phrase)

    return boxes_filt, pred_phrases

def show_mask(mask, ax, random_color=False):
    if random_color:
        color = np.concatenate([np.random.random(3), np.array([0.6])], axis=0)
    else:
        color = np.array([30/255, 144/255, 255/255, 0.6])
    h, w = mask.shape[-2:]
    mask_image = mask.reshape(h, w, 1) * color.reshape(1, 1, -1)
    ax.imshow(mask_image)

def show_masks(image_np, masks: np.ndarray, alpha=0.5):
    image = copy.deepcopy(image_np)
    np.random.seed(0)
    for mask in masks:
        
        color = np.concatenate([np.random.random(3), np.array([0.6])], axis=0)
        image[mask] = image[mask] * (1 - alpha) + 255 * color.reshape(1, 1, -1) * alpha
    return image.astype(np.uint8)

def show_boxes(image_np, boxes, color=(255, 0, 0, 255), thickness=2, show_index=False):
    if boxes is None:
        return image_np

    image = copy.deepcopy(image_np)
    for idx, box in enumerate(boxes):
        x, y, w, h = box
        cv2.rectangle(image, (x, y), (w, h), color, thickness)
        if show_index:
            font = cv2.FONT_HERSHEY_SIMPLEX
            text = str(idx)
            textsize = cv2.getTextSize(text, font, 1, 2)[0]
            cv2.putText(image, text, (x, y+textsize[1]), font, 1, color, thickness)

    return image

def show_box(box, ax, label):
    x0, y0 = box[0], box[1]
    w, h = box[2] - box[0], box[3] - box[1]
    ax.add_patch(plt.Rectangle((x0, y0), w, h, edgecolor='green', facecolor=(0,0,0,0), lw=2)) 
    ax.text(x0, y0, label)


def save_mask_data(output_dir, mask_list, box_list, label_list, file_name):
    value = 0  # 0 for background
    mask_img = torch.zeros(mask_list.shape[-2:])
    for idx, mask in enumerate(mask_list):
        mask_img[mask.cpu().numpy()[0] == True] = value + idx + 1
    plt.figure(figsize=(10, 10))
    plt.imshow(mask_img.numpy())
    plt.axis('off')
    path = os.path.join(output_dir, 'mask')
    if not os.path.exists(path):
        os.makedirs(path)
    plt.savefig(os.path.join(path, file_name + '.jpg'), bbox_inches="tight", dpi=300, pad_inches=0.0)

    # json_data = [{
    #     'value': value,
    #     'label': 'background'
    # }]
    # for label, box in zip(label_list, box_list):
    #     value += 1
    #     name, logit = label.split('(')
    #     logit = logit[:-1] # the last is ')'
    #     json_data.append({
    #         'value': value,
    #         'label': name,
    #         'logit': float(logit),
    #         'box': box.numpy().tolist(),
    #     })
    # with open(os.path.join(output_dir, 'mask.json'), 'w') as f:
    #     json.dump(json_data, f)

def grounded_sam(config_file, grounded_checkpoint, sam_checkpoint, image_path, text_prompt, output_dir, box_threshold, text_threshold, file_name):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    # make dir
    os.makedirs(output_dir, exist_ok=True)
    # load image
    image_pil, image = load_image(image_path)
    # image_np = np.array(image_pil)
    # width, height = simage_pil.size
    # print('image_pil:', image_pil)
    # load model
    model = load_model(config_file, grounded_checkpoint, device=device)

    # visualize raw image
    path = os.path.join(output_dir, 'raw_image')
    if not os.path.exists(path):
        os.makedirs(path)
    image_pil.save(os.path.join(path, file_name + ".jpg"))

    # run grounding dino model
    boxes_filt, pred_phrases = get_grounding_output(
        model, image, text_prompt, box_threshold, text_threshold, device=device
    )

    # initialize SAM
    predictor = SamPredictor(build_sam(checkpoint=sam_checkpoint))
    image = cv2.imread(image_path)
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    predictor.set_image(image)

    size = image_pil.size
    H, W = size[1], size[0]
    for i in range(boxes_filt.size(0)):
        boxes_filt[i] = boxes_filt[i] * torch.Tensor([W, H, W, H])
        boxes_filt[i][:2] -= boxes_filt[i][2:] / 2
        boxes_filt[i][2:] += boxes_filt[i][:2]

    boxes_filt = boxes_filt.cpu()
    transformed_boxes = predictor.transform.apply_boxes_torch(boxes_filt, image.shape[:2])

    masks, _, _ = predictor.predict_torch(
        point_coords = None,
        point_labels = None,
        boxes = transformed_boxes,
        multimask_output = False,
    )
    # draw output image
    plt.figure(figsize=(10, 10))
    plt.imshow(image)

    mask_images, masks_gallery, matted_images = [], [], []
    for mask in masks:
        show_mask(mask.cpu().numpy(), plt.gca(), random_color=True)

        # masks_gallery.append(Image.fromarray(np.any(mask, axis=0)))
        # blended_image = show_masks(show_boxes(image_np, boxes_filt), mask)
        # print(blended_image)
        # mask_images.append(Image.fromarray(blended_image))
        # image_np_copy = copy.deepcopy(image_np)
        # image_np_copy[~np.any(mask, axis=0)] = np.array([0, 0, 0, 0])
        # matted_images.append(Image.fromarray(image_np_copy))
    print('mask_images:', mask_images)

    for box, label in zip(boxes_filt, pred_phrases):
        show_box(box.numpy(), plt.gca(), label)

    plt.axis('off')
    # plt.savefig(
    #     os.path.join(output_dir, "grounded_sam_output.jpg"), 
    #     bbox_inches="tight", dpi=300, pad_inches=0.0
    # )

    save_mask_data(output_dir, masks, boxes_filt, pred_phrases, file_name)

def unzip_file(zip_path, dest_path):
    """
    解压zip文件
    zip_path: string，zip文件路径
    dest_path: string，解压目标路径
    """
    try:
        # with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        #     zip_ref.extractall(dest_path)
        with zipfile.ZipFile(zip_path, 'r') as myzip:
            for zip_info in myzip.infolist():
                # 尝试使用GBK编码(通常用于简体中文Windows)解码文件名
                name_gbk = zip_info.filename.encode('cp437').decode('utf-8')
                name_path = os.path.join(dest_path, name_gbk)
                
                # 确保目标目录存在
                dir_name = os.path.dirname(name_path)
                if not os.path.exists(dir_name):
                    os.makedirs(dir_name)
                    
                # 用解码后的文件名提取文件
                if not os.path.isdir(name_path): # 避免创建空文件夹
                    with myzip.open(zip_info.filename) as src, open(name_path, 'wb') as dst:
                        dst.write(src.read())

        print("File Unzipped Successfully")
        return True
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return False

def get_file_names(folder):
    file_names = []
    for file_name in os.listdir(folder):
        file_names.append(file_name)
    return file_names


def zip_folder(folder_path, output_path):
    # 创建一个 ZipFile 对象
    with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        # 遍历整个文件夹，并添加文件到 zip 文件
        for root, dirs, files in os.walk(folder_path):
            for file in files:
                # 将每个文件添加到 zip 文件
                # os.path.join(root, file) 完整的文件路径
                # os.path.relpath(os.path.join(root, file), folder_path) 文件在文件夹中的路径
                zip_file.write(
                    os.path.join(root, file), 
                    os.path.relpath(os.path.join(root, file), folder_path))

def delete_folder(paths):
    for path in paths:
        if os.path.isfile(path):
            os.remove(path)  # remove the file
        elif os.path.isdir(path):
            shutil.rmtree(path)  # remove dir and all contains

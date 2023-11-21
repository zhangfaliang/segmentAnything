import gradio as gr

import argparse
import os
import copy

import numpy as np
import torch
from PIL import Image, ImageDraw, ImageFont

# Grounding DINO
import GroundingDINO.groundingdino.datasets.transforms as T
from GroundingDINO.groundingdino.models import build_model
from GroundingDINO.groundingdino.util import box_ops
from GroundingDINO.groundingdino.util.slconfig import SLConfig
from GroundingDINO.groundingdino.util.utils import clean_state_dict, get_phrases_from_posmap

# segment anything
from segment_anything import build_sam, SamPredictor 
import cv2
import numpy as np
import matplotlib.pyplot as plt


# diffusers
import PIL
import requests
import torch
from io import BytesIO
from diffusers import StableDiffusionInpaintPipeline
from huggingface_hub import hf_hub_download

import base64

def load_model_hf(model_config_path, repo_id, filename, device='cpu'):
    args = SLConfig.fromfile(model_config_path) 
    model = build_model(args)
    args.device = device

#     cache_file = hf_hub_download(repo_id=repo_id, filename=filename)
    cache_file = 'local_path/groundingdino_swint_ogc.pth'
    checkpoint = torch.load(cache_file, map_location='cpu')
    log = model.load_state_dict(clean_state_dict(checkpoint['model']), strict=False)
    print("Model loaded from {} \n => {}".format(cache_file, log))
    _ = model.eval()
    return model    

def plot_boxes_to_image(image_pil, tgt):
    H, W = tgt["size"]
    boxes = tgt["boxes"]
    labels = tgt["labels"]
    assert len(boxes) == len(labels), "boxes and labels must have same length"

    draw = ImageDraw.Draw(image_pil)
    mask = Image.new("L", image_pil.size, 0)
    mask_draw = ImageDraw.Draw(mask)

    # draw boxes and masks
    for box, label in zip(boxes, labels):
        # from 0..1 to 0..W, 0..H
        box = box * torch.Tensor([W, H, W, H])
        # from xywh to xyxy
        box[:2] -= box[2:] / 2
        box[2:] += box[:2]
        # random color
        color = tuple(np.random.randint(0, 255, size=3).tolist())
        # draw
        x0, y0, x1, y1 = box
        x0, y0, x1, y1 = int(x0), int(y0), int(x1), int(y1)

        draw.rectangle([x0, y0, x1, y1], outline=color, width=6)
        # draw.text((x0, y0), str(label), fill=color)

        font = ImageFont.load_default()
        if hasattr(font, "getbbox"):
            bbox = draw.textbbox((x0, y0), str(label), font)
        else:
            w, h = draw.textsize(str(label), font)
            bbox = (x0, y0, w + x0, y0 + h)
        # bbox = draw.textbbox((x0, y0), str(label))
        draw.rectangle(bbox, fill=color)
        draw.text((x0, y0), str(label), fill="white")

        mask_draw.rectangle([x0, y0, x1, y1], fill=255, width=6)

    return image_pil, mask, (x0, y0, x1, y1)

def load_image(image_path):
    # # load image
    # image_pil = Image.open(image_path).convert("RGB")  # load image
    image_pil = image_path

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


def show_box(box, ax, label):
    x0, y0 = box[0], box[1]
    w, h = box[2] - box[0], box[3] - box[1]
    ax.add_patch(plt.Rectangle((x0, y0), w, h, edgecolor='green', facecolor=(0,0,0,0), lw=2)) 
    ax.text(x0, y0, label)

def get_img_b64(img, fmt='png'):
    img_buffer = BytesIO()
    img.save(img_buffer, format=fmt)
    img_byte = img_buffer.getvalue()
    img_b64 = base64.b64encode(img_byte).decode('utf-8')
    return img_b64

config_file = 'GroundingDINO/groundingdino/config/GroundingDINO_SwinT_OGC.py'
ckpt_repo_id = "ShilongLiu/GroundingDINO"
ckpt_filenmae = "groundingdino_swint_ogc.pth"
sam_checkpoint= 'sam_vit_h_4b8939.pth' 
output_dir="outputs"
device="cuda"

def run_grounded_sam(image_path, text_prompt, task_type, inpaint_prompt, box_threshold, text_threshold, image_name):
    assert text_prompt, 'text_prompt is not found!'

    # make dir
    os.makedirs(output_dir, exist_ok=True)
    # load image
    image_pil, image = load_image(image_path.convert("RGB"))
    # load model
    model = load_model_hf(config_file, ckpt_repo_id, ckpt_filenmae)

    # visualize raw image
    # image_pil.save(os.path.join(output_dir, "raw_image.jpg"))
    # 传入图片文件名
    image_pil.save(os.path.join(output_dir, image_name))

    # run grounding dino model
    boxes_filt, pred_phrases = get_grounding_output(
        model, image, text_prompt, box_threshold, text_threshold, device=device
    )

    size = image_pil.size

    if task_type == 'seg' or task_type == 'inpainting':
        # initialize SAM
        predictor = SamPredictor(build_sam(checkpoint=sam_checkpoint))
        image = np.array(image_path)
        predictor.set_image(image)

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

        # masks: [1, 1, 512, 512]

    if task_type == 'det':

        pred_dict = {
            "boxes": boxes_filt,
            "size": [size[1], size[0]],  # H,W
            "labels": pred_phrases,
        }
        # import ipdb; ipdb.set_trace()
        image_with_box = plot_boxes_to_image(image_pil, pred_dict)[0]
        # image_path = os.path.join(output_dir, "grounding_dino_output.jpg")
        image_path = os.path.join(output_dir, f"grounding_dino_output_{image_name}")
        # image_with_box.save(image_path)
        # image_result = cv2.cvtColor(cv2.imread(image_path), cv2.COLOR_BGR2RGB)
        # return image_result


        # 将检测后的图片转换成png格式后输出base64
        return get_img_b64(image_with_box)
    
    elif task_type == 'seg':
        assert sam_checkpoint, 'sam_checkpoint is not found!'

        # draw output image
        plt.figure(figsize=(10, 10))
        plt.imshow(image)
        for mask in masks:
            show_mask(mask.cpu().numpy(), plt.gca(), random_color=True)
        for box, label in zip(boxes_filt, pred_phrases):
            show_box(box.numpy(), plt.gca(), label)
        plt.axis('off')
        # image_path = os.path.join(output_dir, "grounding_dino_output.jpg")
        image_path = os.path.join(output_dir, f"grounding_dino_output_{image_name}")
        plt.savefig(image_path, bbox_inches="tight")
        # image_result = cv2.cvtColor(cv2.imread(image_path), cv2.COLOR_BGR2RGB)
        # return image_result

        # 将检测后的图片转换成png格式后输出base64
        return get_img_b64(Image.open(image_path))

    elif task_type == 'inpainting':
        assert inpaint_prompt, 'inpaint_prompt is not found!'
        # inpainting pipeline
        mask = masks[0][0].cpu().numpy() # simply choose the first mask, which will be refine in the future release
        mask_pil = Image.fromarray(mask)
        image_pil = Image.fromarray(image)
        
        pipe = StableDiffusionInpaintPipeline.from_pretrained(
        "runwayml/stable-diffusion-inpainting", torch_dtype=torch.float16
        )
        pipe = pipe.to("cuda")

        image = pipe(prompt=inpaint_prompt, image=image_pil, mask_image=mask_pil).images[0]
        # image_path = os.path.join(output_dir, "grounded_sam_inpainting_output.jpg")
        # image_path = os.path.join(output_dir, f"grounding_dino_output_{image_name}")
        # image.save(image_path)
        # image_result = cv2.cvtColor(cv2.imread(image_path), cv2.COLOR_BGR2RGB)
        # return image_result

        # 将检测后的图片转换成png格式后输出base64
        return get_img_b64(image)
    
    else:
        print("task_type:{} error!".format(task_type))
        
def run_grounded_sam_bbox(image_path, text_prompt, task_type, inpaint_prompt, box_threshold, text_threshold, image_name):
    assert text_prompt, 'text_prompt is not found!'

    # make dir
    os.makedirs(output_dir, exist_ok=True)
    # load image
    image_pil, image = load_image(image_path.convert("RGB"))
    # load model
    model = load_model_hf(config_file, ckpt_repo_id, ckpt_filenmae)

    # visualize raw image
    # image_pil.save(os.path.join(output_dir, "raw_image.jpg"))
    # 传入图片文件名
    # image_pil.save(os.path.join(output_dir, image_name))

    # run grounding dino model
    boxes_filt, pred_phrases = get_grounding_output(
        model, image, text_prompt, box_threshold, text_threshold, device=device
    )

    size = image_pil.size

    if task_type == 'seg' or task_type == 'inpainting':
        # initialize SAM
        predictor = SamPredictor(build_sam(checkpoint=sam_checkpoint))
        image = np.array(image_path)
        predictor.set_image(image)

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

        # masks: [1, 1, 512, 512]

    if task_type == 'det':

        pred_dict = {
            "boxes": boxes_filt,
            "size": [size[1], size[0]],  # H,W
            "labels": pred_phrases,
        }
        # import ipdb; ipdb.set_trace()
        image_with_box = plot_boxes_to_image(image_pil, pred_dict)[0]
        bbox = plot_boxes_to_image(image_pil, pred_dict)[2]
        # image_path = os.path.join(output_dir, "grounding_dino_output.jpg")
        # image_path = os.path.join(output_dir, f"grounding_dino_output_{image_name}")
        # image_with_box.save(image_path)
        # image_result = cv2.cvtColor(cv2.imread(image_path), cv2.COLOR_BGR2RGB)
        # return image_result


        # 将检测后的图片转换成png格式后输出base64
        # return get_img_b64(image_with_box)
        return bbox

from fastapi import FastAPI, Body, responses
import json
import uvicorn
from PIL import Image
from typing import Optional
from pydantic import BaseModel


app = FastAPI()
class Item(BaseModel):
    pic_url: str
    task_type: str
    text_prompt: str
    box_threshold: float
    text_threshold: float

@app.post("/gsa")
async def main(data: Item):

    parser = argparse.ArgumentParser("Grounded SAM demo", add_help=True)
    parser.add_argument("--debug", action="store_true", help="using debug mode")
    parser.add_argument("--share", action="store_true", help="share the app")
    args = parser.parse_args()


    '''
        post data
        {
            'pic_url': 'pic_url',
            'task_type': 'det | seg',
            'text_prompt': 'Detection Prompt',
            'box_threshold': float,
            'text_threshold': float
        }
    '''
    # data 是一个Item对象，用 . 语法来获取
    # 获取图片
    pic = data.pic_url
    img_name = pic.split('/')[-1]

    # 转换图片
    img_path = Image.open(BytesIO(requests.get(pic).content))
    
    # 图片处理
    # image_path, text_prompt, task_type, inpaint_prompt, box_threshold, text_threshold
    res = run_grounded_sam(image_path=img_path, text_prompt=data.text_prompt, task_type=data.task_type, inpaint_prompt='', box_threshold=data.box_threshold, text_threshold=data.text_threshold, image_name=img_name)

    # 返回图片的base64值，完整值
    return responses.JSONResponse(content={"data": res, "prefix": "data:image/png;base64,"})
@app.post("/crop")
async def crop(img):
    parser = argparse.ArgumentParser("Grounded SAM demo", add_help=True)
    parser.add_argument("--debug", action="store_true", help="using debug mode")
    parser.add_argument("--share", action="store_true", help="share the app")
    # ic(img)
    
    if os.path.exists(img):
        # 如果是本地文件则直接打开
        img_path = Image.open(img)
    else:
        # 如果是远程图片链接则使用二进制流的方式处理
        img_path = Image.open(BytesIO(requests.get(img).content))
    res = run_grounded_sam_bbox(image_path=img_path, text_prompt='a bottle', task_type='det', inpaint_prompt='', box_threshold=0.4, text_threshold=0.4, image_name='demo.jpg')
    return res
if __name__ == "__main__":
    uvicorn.run(app='det_api:app', host='0.0.0.0', port=7590, reload=True)

import numpy as np
import cv2
import matplotlib.pyplot as plt
from segment_anything import sam_model_registry, SamPredictor
from segment_anything.utils.onnx import SamOnnxModel

import onnxruntime
import  torch

# python scripts/export_onnx_model.py --checkpoint sam_vit_h_4b8939.pth --model-type vit_h --output sam_rt_onnx_quantized_example.onnx
# python scripts/export_onnx_model.py --checkpoint sam_vit_h_4b8939.pth --model-type vit_h --output sam_3d_onnx_quantized_example.onnx
# python scripts/export_onnx_model.py --checkpoint sam_vit_h_4b8939.pth --model-type vit_h --output sam_test_onnx_quantized_example.onnx
# python scripts/export_onnx_model.py --checkpoint sam_vit_h_4b8939.pth --model-type vit_h --output sam_shigao_onnx_quantized_example.onnx


def show_mask(mask, ax):
    color = np.array([30 / 255, 144 / 255, 255 / 255, 0.6])
    h, w = mask.shape[-2:]
    mask_image = mask.reshape(h, w, 1) * color.reshape(1, 1, -1)
    ax.imshow(mask_image)


def show_points(coords, labels, ax, marker_size=375):
    pos_points = coords[labels == 1]
    neg_points = coords[labels == 0]
    ax.scatter(pos_points[:, 0], pos_points[:, 1], color='green', marker='*', s=marker_size, edgecolor='white',
               linewidth=1.25)
    ax.scatter(neg_points[:, 0], neg_points[:, 1], color='red', marker='*', s=marker_size, edgecolor='white',
               linewidth=1.25)


def show_box(box, ax):
    x0, y0 = box[0], box[1]
    w, h = box[2] - box[0], box[3] - box[1]
    ax.add_patch(plt.Rectangle((x0, y0), w, h, edgecolor='green', facecolor=(0, 0, 0, 0), lw=2))


checkpoint = "sam_vit_h_4b8939.pth"
model_type = "vit_h"


ort_session = onnxruntime.InferenceSession('sam_onnx_example.onnx')
sam = sam_model_registry[model_type](checkpoint=checkpoint)
DEVICE = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
sam.to(device=DEVICE)

predictor = SamPredictor(sam)
image = cv2.imread('./demo/src/assets/data/rt.jpeg')
predictor.set_image(image)
image_embedding = predictor.get_image_embedding().cpu().numpy()
np.save("./demo/src/assets/data/rt_embedding.npy", image_embedding)

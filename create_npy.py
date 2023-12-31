import asyncio
import numpy as np
import cv2
from segment_anything import sam_model_registry, SamPredictor
from segment_anything.utils.onnx import SamOnnxModel
import onnxruntime
import  torch

async def process_image(image_path, save_path):
   

    checkpoint = "sam_vit_h_4b8939.pth"
    model_type = "vit_h"
    ort_session = onnxruntime.InferenceSession('sam_onnx_example.onnx')
    sam = sam_model_registry[model_type](checkpoint=checkpoint)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    sam.to(device)
    print('使用的是',device)
    predictor = SamPredictor(sam)
    
    image = cv2.imread(image_path)
    predictor.set_image(image)
    image_embedding = predictor.get_image_embedding().cpu().numpy()
    np.save(save_path, image_embedding)

import gradio as gr
import  numpy as np
import  torch
from diffusers import StableDiffusionInpaintPipeline
from PIL import Image
from segment_anything import SamPredictor, sam_model_registry

sam_checkpoint = "sam_vit_h_4b8939.pth"
model_type = "vit_h"
sam = sam_model_registry[model_type](checkpoint=sam_checkpoint)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
sam.to(device)
predictor = SamPredictor(sam)

pipe = StableDiffusionInpaintPipeline.from_pretrained("stabilityai/stable-diffusion-2-inpainting",
                                                      torch_dtype=torch.float16,
                                                      )
pipe  = pitp.to(device)
with gr.Blocks() as demo:
    with gr.Row():
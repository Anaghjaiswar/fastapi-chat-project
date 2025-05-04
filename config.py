import cloudinary
import os

cloudinary.config(
    CLOUD_NAME= os.getenv('CLOUDINARY_CLOUD_NAME'),
    API_KEY= os.getenv('CLOUDINARY_API_KEY'),
    API_SECRET= os.getenv('CLOUDINARY_API_SECRET'),
)
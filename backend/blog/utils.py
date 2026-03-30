# blog/utils.py
from imagekitio import ImageKit
from django.conf import settings

imagekit = ImageKit(
    private_key=settings.IMAGEKIT_PRIVATE_KEY,
    public_key=settings.IMAGEKIT_PUBLIC_KEY,
    url_endpoint=settings.IMAGEKIT_URL_ENDPOINT
)

def upload_to_imagekit(file, folder='blog'):
    """Upload file to ImageKit and return URL"""
    result = imagekit.upload_file(
        file=file,
        file_name=file.name,
        options={
            "folder": f"/{folder}/",
            "is_private_file": False,
            "use_unique_file_name": True,
        }
    )
    return result.url
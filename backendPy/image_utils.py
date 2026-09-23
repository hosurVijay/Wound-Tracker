import requests


def download_image(image_url):

    response = requests.get(
        image_url,
        timeout=30
    )

    response.raise_for_status()

    return response.content
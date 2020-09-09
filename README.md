
# ImageMagick API

## Deploy

```bash
# login
gcloud auth login
gcloud config set project logione-doc

# docker
rm -r node_modules
docker build . -t eu.gcr.io/logione-doc/imagemagick
docker push eu.gcr.io/logione-doc/imagemagick

# cloud-run
gcloud run deploy imagemagick --image=eu.gcr.io/logione-doc/imagemagick --max-instances=10 --concurrency=10 --memory=128Mi --port=8081 --no-allow-unauthenticated --region=europe-west1 --platform=managed
```

## Examples

### Convert PDF

```bash
docker run -v $(pwd):/images --rm -it dpokidov/imagemagick -density 200 /images/1.pdf[0] -flatten -quality 80 /images/1.png
```

```bash
docker run -v $(pwd):/images --rm -it ubuntu

apt-get update; apt-get install openjdk-11-jre pdftk -y
pdftk /images/1.pdf cat 1-2 output /images/10.pdf
```

### Convert JPG

```bash
docker run -v $(pwd):/images --rm -it dpokidov/imagemagick images/6.jpg -resize 1000000@ -quality 80 images/6.jpg
```

### Convert DOCX

```bash
docker run -v $(pwd):/images --rm -it --entrypoint /bin/bash dpokidov/imagemagick

apt update; apt install libreoffice -y
convert -density 200 /images/5.docx[0] -quality 80 -flatten /images/5.pdf
```
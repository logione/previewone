
# ImageMagick API

## Deploy

```bash
# config gcloud
gcloud config set project logione-doc
gcloud auth configure-docker europe-west6-docker.pkg.dev

# login
gcloud auth login

# docker
docker build . --no-cache -t europe-west6-docker.pkg.dev/logione-doc/public/imagemagick
docker push europe-west6-docker.pkg.dev/logione-doc/public/imagemagick

# cloud-run
gcloud run deploy imagemagick --image=europe-west6-docker.pkg.dev/logione-doc/public/imagemagick --max-instances=20 --concurrency=2 --memory=512Mi --port=8081 --no-allow-unauthenticated --region=europe-west6 --platform=managed
```

## Test

```bash
docker build . -t europe-west6-docker.pkg.dev/logione-doc/public/imagemagick
docker run -it -p 8081:8081 --rm -d --name imagemagick europe-west6-docker.pkg.dev/logione-doc/public/imagemagick
# use thunder client to test query
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
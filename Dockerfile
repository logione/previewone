FROM node:lts

RUN apt-get update ; apt-get install imagemagick libreoffice ghostscript -y
RUN sed -i_bak 's/rights="none" pattern="PDF"/rights="read | write" pattern="PDF"/' /etc/ImageMagick-6/policy.xml
COPY . /app
WORKDIR /app
RUN npm ci ; npm run build ; npm ci --prod

EXPOSE 8081
CMD npm start
FROM debian:11-slim

RUN apt-get update ; apt-get install imagemagick libreoffice ghostscript tini -y
RUN sed -i_bak 's/rights="none" pattern="PDF"/rights="read | write" pattern="PDF"/' /etc/ImageMagick-6/policy.xml
WORKDIR /app
COPY ./exe /app

EXPOSE 8081
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD /app/exe
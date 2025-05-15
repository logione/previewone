FROM node:22-bookworm AS build
WORKDIR /app
COPY . .
RUN npm ci
RUN npx esbuild ./src/index.ts  --bundle --minify --legal-comments=none --platform=node --target=node22 --outdir=.

FROM node:22-bookworm
RUN apt-get update ; apt-get install imagemagick libreoffice ghostscript tini -y
RUN sed -i_bak 's/rights="none" pattern="PDF"/rights="read | write" pattern="PDF"/' /etc/ImageMagick-6/policy.xml
WORKDIR /app
COPY --from=build /app/index.js .
EXPOSE 8081
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "index.js"]

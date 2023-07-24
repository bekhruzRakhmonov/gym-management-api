######### Build #########
FROM node:16-alpine3.17 as build
WORKDIR /home/zuuv-app/
COPY . .
RUN yarn install --frozen-lockfile --silent && yarn build

######### Production #########
FROM node:16-alpine3.17
COPY --from=build /home/zuuv-app/package.json package.json
COPY --from=build /home/zuuv-app/dist ./dist
COPY --from=build /home/zuuv-app/node_modules node_modules
EXPOSE 3000
CMD ["node", "dist/main.js"]
FROM node:18-alpine

WORKDIR /app

# Copia dependencias
COPY package.json package-lock.json ./

# Instala dependencias
RUN npm install

# Copia el resto de archivos
COPY . .

# Expone el puerto
EXPOSE 3000

# Ejecutar
CMD ["npm", "start"]
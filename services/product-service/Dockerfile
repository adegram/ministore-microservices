FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

# Copy only dependency files first for better Docker layer caching
COPY package*.json ./

# Install only production dependencies using the lock file
RUN npm ci --omit=dev && npm cache clean --force

COPY . .

# Use the non-root user that comes with the official Node image
USER node

EXPOSE 3001
# Start the Express application
CMD ["npm", "start"]
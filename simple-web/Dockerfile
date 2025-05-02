FROM nginx:alpine

# Copy the HTML file
COPY index.html /usr/share/nginx/html/index.html

# Configure nginx to listen on port 8080 (required for Cloud Run)
RUN sed -i 's/listen       80/listen       8080/g' /etc/nginx/conf.d/default.conf

# Expose port 8080
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

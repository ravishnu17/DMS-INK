bind = "0.0.0.0:8007"
workers = 1
worker_class = "uvicorn.workers.UvicornWorker"
log_file = "/var/log/dms_ink.log"
accesslog = log_file
errorlog = log_file
loglevel = "info"
 
# certfile = "/etc/ssl/certs/fullchain.pem"
# keyfile = "/etc/ssl/private/privkey.pem"
# ca_certs = "/etc/ssl/certs/chain.pem"  # Optional  (if using intermediate/chain certs)
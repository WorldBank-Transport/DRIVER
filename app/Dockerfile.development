FROM driver-app:latest

RUN pip install --no-cache-dir djsonb -r dev-requirements.txt --src /opt
EXPOSE 8000

CMD ["driver.wsgi", "-w1", "-b:4000", "--reload", "-kgevent"]
